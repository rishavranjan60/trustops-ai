from sqlalchemy import Column, Float, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=False)

    input_text = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    generated_output = Column(Text, nullable=True)

    model_name = Column(String(100), nullable=True)
    score = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    status = Column(String(50), default="completed")

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
    dataset = relationship("Dataset")
    prompt = relationship("Prompt")