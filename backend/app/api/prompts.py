from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.database import get_db
from app.models.project import Project
from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate, PromptResponse


router = APIRouter(prefix="/prompts", tags=["Prompts"])


@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(
    payload: PromptCreate,
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

    prompt = Prompt(
        project_id=payload.project_id,
        name=payload.name,
        system_prompt=payload.system_prompt,
        user_prompt=payload.user_prompt,
        model_name=payload.model_name,
        temperature=payload.temperature,
        version=payload.version,
    )

    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    return prompt


@router.get("/project/{project_id}", response_model=List[PromptResponse])
def list_prompts_by_project(
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

    prompts = (
        db.query(Prompt)
        .filter(Prompt.project_id == project_id)
        .order_by(Prompt.created_at.desc())
        .all()
    )

    return prompts


@router.delete("/{prompt_id}")
def delete_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )

    project = (
        db.query(Project)
        .filter(Project.id == prompt.project_id, Project.owner_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this prompt",
        )

    db.delete(prompt)
    db.commit()

    return {"message": "Prompt deleted successfully"}