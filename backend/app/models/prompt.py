from sqlalchemy import Column, Float, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    name = Column(String(150), nullable=False)
    system_prompt = Column(Text, nullable=True)
    user_prompt = Column(Text, nullable=False)

    model_name = Column(String(100), nullable=True)
    temperature = Column(Float, default=0.7)
    version = Column(String(50), default="v1")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")