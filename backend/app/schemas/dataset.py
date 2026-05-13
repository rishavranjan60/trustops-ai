from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DatasetCreate(BaseModel):
    project_id: int
    input_text: str
    expected_output: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None


class DatasetResponse(BaseModel):
    id: int
    project_id: int
    input_text: str
    expected_output: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True