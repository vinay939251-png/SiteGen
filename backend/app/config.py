import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SiteGen Feasibility API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database: Supports Antideploy / Neon Postgres (DATABASE_URL) or SQLite local fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sitegen.db")
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]
    
    # Static build folder (optional serving for fullstack deploy)
    STATIC_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

