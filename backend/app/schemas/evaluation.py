from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EvaluationCreate(BaseModel):
    project_id: int
    dataset_id: int
    prompt_id: int


class EvaluationResponse(BaseModel):
    id: int
    project_id: int
    dataset_id: int
    prompt_id: int

    input_text: str
    expected_output: Optional[str] = None
    generated_output: Optional[str] = None

    model_name: Optional[str] = None
    score: Optional[float] = None
    latency_ms: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

    created_at: datetime

    class Config:
        from_attributes = True