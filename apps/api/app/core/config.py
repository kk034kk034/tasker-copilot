from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    api_host: str = os.getenv("API_HOST", "127.0.0.1")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///apps/api/data/tasker_copilot.db")
    cors_allowed_origins: tuple[str, ...] = tuple(
        item.strip()
        for item in os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://127.0.0.1:8000,http://localhost:8000,chrome-extension://REPLACE_WITH_EXTENSION_ID",
        ).split(",")
        if item.strip()
    )
    api_key: str = os.getenv("API_KEY", "")
    enable_anonymous_token_auth: bool = (
        os.getenv("ENABLE_ANONYMOUS_TOKEN_AUTH", "true").lower() == "true"
    )
    anonymous_token_ttl_seconds: int = int(os.getenv("ANONYMOUS_TOKEN_TTL_SECONDS", "3600"))
    exempt_paths_from_api_key: tuple[str, ...] = ("/health", "/docs", "/openapi.json", "/redoc")
    enable_llm: bool = os.getenv("ENABLE_LLM", "false").lower() == "true"
    llm_provider: str = os.getenv("LLM_PROVIDER", "mock")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_base_url: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


settings = Settings()
