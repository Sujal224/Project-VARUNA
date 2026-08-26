"""
VARUNA Backend Core Settings Configuration
"""

import os
from typing import List
from pydantic import BaseModel, Field

try:
    from pydantic_settings import BaseSettings
    ConfigBase = BaseSettings
except ImportError:
    ConfigBase = BaseModel


class Settings(ConfigBase):
    PROJECT_NAME: str = "VARUNA Marine Intelligence API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://10.0.2.2:8081",
        "*",
    ]

    # Firebase
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "project-varuna")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")

    # GCP
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "project-varuna")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "project-varuna-marine-data")

    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")


settings = Settings()
