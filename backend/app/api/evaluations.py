import re
import time
from difflib import SequenceMatcher

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.core.config import settings
from app.db.database import get_db
from app.models.dataset import Dataset
from app.models.evaluation import Evaluation
from app.models.project import Project
from app.models.prompt import Prompt
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse
from app.services.evaluation_service import calculate_evaluation_score, get_score_label
from app.services.gemini_service import generate_gemini_response



router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

def generate_mock_llm_response(prompt: Prompt, dataset: Dataset) -> str:
    """
    Clean mock fallback response.

    Used when:
    - USE_REAL_LLM=False
    - Gemini quota is exhausted
    - Gemini API call fails with quota/resource error

    Important:
    The generated output should only contain the assistant answer.
    It should not repeat:
    - system prompt
    - user instruction
    - input text
    """

    input_text = dataset.input_text or ""
    normalized_input = input_text.lower().strip()

    if not normalized_input:
        return "I could not generate a proper response because no input was provided."

    if "kubernetes" in normalized_input:
        return (
            "Kubernetes is a platform that helps run, manage, and scale "
            "containerized applications."
        )

    if "docker" in normalized_input:
        return (
            "Docker is a tool used to package an application with everything "
            "it needs so it can run consistently in different environments."
        )

    if "api" in normalized_input:
        return (
            "An API allows different software applications to communicate "
            "with each other and exchange data."
        )

    if "database" in normalized_input:
        return (
            "A database is a system used to store, organize, and manage data "
            "so applications can access it easily."
        )

    if "fastapi" in normalized_input:
        return (
            "FastAPI is a Python web framework used to build fast and modern "
            "APIs with automatic documentation."
        )

    if "react" in normalized_input:
        return (
            "React is a JavaScript library used to build interactive user "
            "interfaces for web applications."
        )

    if "next.js" in normalized_input or "nextjs" in normalized_input:
        return (
            "Next.js is a React framework used to build fast, full-stack web "
            "applications with features like routing and server-side rendering."
        )

    if "llm" in normalized_input or "large language model" in normalized_input:
        return (
            "A large language model is an AI system that understands and "
            "generates human-like text based on the input it receives."
        )

    if "mlflow" in normalized_input:
        return (
            "MLflow is a tool used to track machine learning experiments, "
            "models, metrics, and results."
        )

    if "qdrant" in normalized_input:
        return (
            "Qdrant is a vector database used to store and search embeddings "
            "for semantic search and RAG applications."
        )

    return (
        "This is a clean mock fallback response generated because the main "
        "AI provider was unavailable. It should be replaced by a real LLM "
        "response when the provider quota or connection is available."
    )


def get_safe_gemini_model(prompt_model_name: str | None) -> str:
    if prompt_model_name and prompt_model_name.startswith("gemini"):
        return prompt_model_name

    return settings.GEMINI_MODEL


@router.post("/run", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def run_evaluation(
    payload: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(Project.id == payload.project_id, Project.owner_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == payload.dataset_id,
            Dataset.project_id == payload.project_id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found for this project",
        )

    prompt = (
        db.query(Prompt)
        .filter(
            Prompt.id == payload.prompt_id,
            Prompt.project_id == payload.project_id,
        )
        .first()
    )

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found for this project",
        )

    start_time = time.perf_counter()

    use_real_llm = settings.USE_REAL_LLM
    llm_note = "Mock evaluation run."
    generated_output = ""

    try:
        if use_real_llm:
            gemini_model = get_safe_gemini_model(prompt.model_name)

            generated_output = generate_gemini_response(
                system_prompt=prompt.system_prompt,
                user_prompt=prompt.user_prompt,
                input_text=dataset.input_text,
                expected_output=dataset.expected_output,
                model_name=gemini_model,
            )

            llm_note = "Real Gemini evaluation run."

        else:
            generated_output = generate_mock_llm_response(prompt, dataset)
            llm_note = "Mock evaluation run."

    except Exception as error:
        error_message = str(error)

        if (
            "429" in error_message
            or "RESOURCE_EXHAUSTED" in error_message
            or "quota" in error_message.lower()
        ):
            generated_output = generate_mock_llm_response(prompt, dataset)
            llm_note = (
                "Gemini quota exhausted. Automatically used mock fallback. "
                "No paid API call was completed."
            )
            use_real_llm = False

        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"LLM generation failed: {error_message}",
            )

    end_time = time.perf_counter()
    latency_ms = round((end_time - start_time) * 1000, 2)

    score = calculate_evaluation_score(dataset.expected_output, generated_output)
    score_label = get_score_label(score)

    model_name = (
        get_safe_gemini_model(prompt.model_name)
        if use_real_llm
        else "mock-fallback"
    )

    evaluation = Evaluation(
        project_id=payload.project_id,
        dataset_id=payload.dataset_id,
        prompt_id=payload.prompt_id,
        input_text=dataset.input_text,
        expected_output=dataset.expected_output,
        generated_output=generated_output,
        model_name=model_name,
        score=score,
        latency_ms=latency_ms,
        status="completed",
        notes=f"{llm_note} Score label: {score_label}.",
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return evaluation


@router.get("/project/{project_id}", response_model=List[EvaluationResponse])
def list_evaluations_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.project_id == project_id)
        .order_by(Evaluation.created_at.desc())
        .all()
    )

    return evaluations


@router.delete("/{evaluation_id}")
def delete_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found",
        )

    project = (
        db.query(Project)
        .filter(Project.id == evaluation.project_id, Project.owner_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this evaluation",
        )

    db.delete(evaluation)
    db.commit()

    return {"message": "Evaluation deleted successfully"}