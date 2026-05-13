import re
from difflib import SequenceMatcher


STOP_WORDS = {
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "to",
    "of",
    "for",
    "and",
    "or",
    "in",
    "on",
    "with",
    "that",
    "this",
    "it",
    "as",
    "by",
    "from",
    "at",
    "into",
    "about",
    "your",
    "you",
    "they",
    "them",
    "their",
    "can",
    "also",
    "like",
}


SYNONYM_GROUPS = [
    {"run", "running", "runs"},
    {"manage", "managing", "management", "managed"},
    {"container", "containers", "containerized"},
    {"application", "applications", "app", "apps", "program", "programs"},
    {"platform", "system", "tool", "service"},
    {"scale", "scaling", "scalable"},
    {"organize", "organizer", "orchestrate", "orchestration"},
]


_semantic_model = None
_semantic_model_loaded = False


def normalize_text(text: str | None) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def simple_stem(word: str) -> str:
    word = word.lower().strip()

    if len(word) > 5 and word.endswith("ing"):
        return word[:-3]

    if len(word) > 4 and word.endswith("ed"):
        return word[:-2]

    if len(word) > 4 and word.endswith("es"):
        return word[:-2]

    if len(word) > 3 and word.endswith("s"):
        return word[:-1]

    return word


def expand_with_synonyms(words: set[str]) -> set[str]:
    expanded = set(words)

    for word in list(words):
        stemmed_word = simple_stem(word)
        expanded.add(stemmed_word)

        for group in SYNONYM_GROUPS:
            group_stems = {simple_stem(item) for item in group}

            if word in group or stemmed_word in group_stems:
                expanded.update(group)
                expanded.update(group_stems)

    return expanded


def get_words(text: str | None) -> set[str]:
    cleaned = normalize_text(text)

    words = {
        simple_stem(word)
        for word in cleaned.split()
        if word and word not in STOP_WORDS
    }

    return expand_with_synonyms(words)


def get_important_words(text: str | None) -> set[str]:
    words = get_words(text)

    return {
        word
        for word in words
        if len(word) > 4
    }


def calculate_sequence_score(
    expected_output: str | None,
    generated_output: str | None,
) -> float:
    expected_clean = normalize_text(expected_output)
    generated_clean = normalize_text(generated_output)

    if not expected_clean or not generated_clean:
        return 0.0

    return SequenceMatcher(None, expected_clean, generated_clean).ratio()


def calculate_word_overlap_score(
    expected_output: str | None,
    generated_output: str | None,
) -> float:
    expected_words = get_words(expected_output)
    generated_words = get_words(generated_output)

    if not expected_words:
        return 0.0

    return len(expected_words.intersection(generated_words)) / len(expected_words)


def calculate_keyword_score(
    expected_output: str | None,
    generated_output: str | None,
) -> float:
    expected_keywords = get_important_words(expected_output)
    generated_words = get_words(generated_output)

    if not expected_keywords:
        return calculate_word_overlap_score(expected_output, generated_output)

    return len(expected_keywords.intersection(generated_words)) / len(expected_keywords)


def calculate_length_balance_score(
    expected_output: str | None,
    generated_output: str | None,
) -> float:
    expected_clean = normalize_text(expected_output)
    generated_clean = normalize_text(generated_output)

    if not expected_clean or not generated_clean:
        return 0.0

    expected_len = len(expected_clean.split())
    generated_len = len(generated_clean.split())

    if expected_len == 0 or generated_len == 0:
        return 0.0

    ratio = min(expected_len, generated_len) / max(expected_len, generated_len)

    return ratio


def calculate_concept_bonus(
    expected_output: str | None,
    generated_output: str | None,
) -> float:
    expected_words = get_words(expected_output)
    generated_words = get_words(generated_output)

    bonus = 0.0

    important_concepts = [
        {"container", "containers", "containerized"},
        {"run", "running", "runs"},
        {"manage", "managing", "management"},
        {"application", "applications", "program", "programs"},
        {"platform", "system", "tool"},
    ]

    for concept_group in important_concepts:
        concept_stems = {simple_stem(word) for word in concept_group}

        expected_has_concept = bool(expected_words.intersection(concept_stems))
        generated_has_concept = bool(generated_words.intersection(concept_stems))

        if expected_has_concept and generated_has_concept:
            bonus += 0.05

    return min(bonus, 0.20)


def get_semantic_model():
    global _semantic_model
    global _semantic_model_loaded

    if _semantic_model_loaded:
        return _semantic_model

    _semantic_model_loaded = True

    try:
        from sentence_transformers import SentenceTransformer

        _semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
        return _semantic_model

    except Exception:
        _semantic_model = None
        return None


def calculate_semantic_score(
    expected_output: str | None,
    generated_output: str | None,
) -> float | None:
    if not expected_output or not generated_output:
        return None

    model = get_semantic_model()

    if model is None:
        return None

    try:
        embeddings = model.encode(
            [expected_output, generated_output],
            normalize_embeddings=True,
        )

        semantic_score = float(embeddings[0] @ embeddings[1])

        if semantic_score < 0:
            semantic_score = 0.0

        if semantic_score > 1:
            semantic_score = 1.0

        return semantic_score

    except Exception:
        return None


def calculate_evaluation_score(
    expected_output: str | None,
    generated_output: str | None,
) -> float:
    if not expected_output or not generated_output:
        return 0.0

    word_overlap_score = calculate_word_overlap_score(
        expected_output,
        generated_output,
    )

    keyword_score = calculate_keyword_score(
        expected_output,
        generated_output,
    )

    sequence_score = calculate_sequence_score(
        expected_output,
        generated_output,
    )

    length_balance_score = calculate_length_balance_score(
        expected_output,
        generated_output,
    )

    concept_bonus = calculate_concept_bonus(
        expected_output,
        generated_output,
    )

    semantic_score = calculate_semantic_score(
        expected_output,
        generated_output,
    )

    if semantic_score is not None:
        final_score = (
            semantic_score * 0.50
            + keyword_score * 0.25
            + word_overlap_score * 0.10
            + sequence_score * 0.10
            + length_balance_score * 0.05
            + concept_bonus
        )
    else:
        final_score = (
            keyword_score * 0.40
            + word_overlap_score * 0.30
            + sequence_score * 0.15
            + length_balance_score * 0.15
            + concept_bonus
        )

    if final_score > 1:
        final_score = 1.0

    return round(final_score, 2)


def get_score_label(score: float) -> str:
    if score >= 0.85:
        return "Excellent"

    if score >= 0.65:
        return "Good"

    if score >= 0.45:
        return "Weak"

    return "Poor"