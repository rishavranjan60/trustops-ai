from typing import Optional

from google import genai

from app.core.config import settings


def build_gemini_prompt(
    system_prompt: Optional[str],
    user_prompt: str,
    input_text: str,
    expected_output: Optional[str] = None,
) -> str:
    prompt_parts = []

    if system_prompt:
        prompt_parts.append(f"System instruction:\n{system_prompt}")

    prompt_parts.append(f"User instruction:\n{user_prompt}")
    prompt_parts.append(f"Input text:\n{input_text}")

    if expected_output:
        prompt_parts.append(
            "Reference expected output is provided only for context. "
            "Do not copy it directly. Use it to understand the ideal answer style."
        )
        prompt_parts.append(f"Expected output:\n{expected_output}")

    prompt_parts.append(
        "Now generate the best possible answer for the input text. "
        "Return only the answer, without extra explanation."
    )

    return "\n\n".join(prompt_parts)


def generate_gemini_response(
    system_prompt: Optional[str],
    user_prompt: str,
    input_text: str,
    expected_output: Optional[str] = None,
    model_name: Optional[str] = None,
) -> str:
    api_key = settings.GEMINI_API_KEY
    if model_name and model_name.startswith("gemini"):
        model = model_name
    else:
        model = settings.GEMINI_MODEL

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing in backend .env")

    client = genai.Client(api_key=api_key)

    final_prompt = build_gemini_prompt(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        input_text=input_text,
        expected_output=expected_output,
    )

    response = client.models.generate_content(
        model=model,
        contents=final_prompt,
    )

    text = getattr(response, "text", None)

    if not text:
        return "Gemini returned an empty response."

    return text.strip()