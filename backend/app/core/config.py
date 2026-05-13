from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TrustOps AI"
    APP_ENV: str = "development"

    # Database
    DATABASE_URL: str

    # JWT / Auth
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # MLflow / Qdrant
    MLFLOW_TRACKING_URI: str | None = None
    QDRANT_URL: str | None = None

    # Gemini / LLM
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    USE_REAL_LLM: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()