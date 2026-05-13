from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.database import get_db
from app.models.project import Project
from app.models.dataset import Dataset
from app.models.prompt import Prompt
from app.models.evaluation import Evaluation


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
def get_report_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    project_ids = [project.id for project in projects]

    if not project_ids:
        return {
            "projects": 0,
            "datasets": 0,
            "prompts": 0,
            "evaluations": 0,
            "average_score": 0,
            "average_latency_ms": 0,
        }

    datasets_count = (
        db.query(Dataset)
        .filter(Dataset.project_id.in_(project_ids))
        .count()
    )

    prompts_count = (
        db.query(Prompt)
        .filter(Prompt.project_id.in_(project_ids))
        .count()
    )

    evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.project_id.in_(project_ids))
        .all()
    )

    evaluations_count = len(evaluations)

    scores = [
        evaluation.score
        for evaluation in evaluations
        if evaluation.score is not None
    ]

    latencies = [
        evaluation.latency_ms
        for evaluation in evaluations
        if evaluation.latency_ms is not None
    ]

    average_score = round(sum(scores) / len(scores), 2) if scores else 0
    average_latency_ms = round(sum(latencies) / len(latencies), 2) if latencies else 0

    return {
        "projects": len(projects),
        "datasets": datasets_count,
        "prompts": prompts_count,
        "evaluations": evaluations_count,
        "average_score": average_score,
        "average_latency_ms": average_latency_ms,
    }