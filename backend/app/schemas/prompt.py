from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PromptCreate(BaseModel):
    project_id: int
    name: str
    system_prompt: Optional[str] = None
    user_prompt: str
    model_name: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.7
    version: Optional[str] = "v1"


class PromptResponse(BaseModel):
    id: int
    project_id: int
    name: str
    system_prompt: Optional[str] = None
    user_prompt: str
    model_name: Optional[str] = None
    temperature: Optional[float] = None
    version: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True