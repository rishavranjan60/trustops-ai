from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router
from app.api.projects import router as projects_router
from app.api.datasets import router as datasets_router
from app.api.prompts import router as prompts_router
from app.api.evaluations import router as evaluations_router
from app.api.reports import router as reports_router

from app.db.base import Base
from app.db.database import engine
from app.utils.health import get_health_status

# Import models so SQLAlchemy can create tables automatically
from app.auth import models as auth_models  # noqa: F401
from app.models import project as project_models  # noqa: F401
from app.models import dataset as dataset_models  # noqa: F401
from app.models import prompt as prompt_models  # noqa: F401
from app.models import evaluation as evaluation_models  # noqa: F401


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TrustOps AI API",
    description="Production AI Evaluation and MLOps Platform",
    version="0.1.0",
)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(datasets_router)
app.include_router(prompts_router)
app.include_router(evaluations_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to TrustOps AI API",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return get_health_status()