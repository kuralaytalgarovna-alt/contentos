from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    app_name: str = "ContentOS API"
    environment: str = "development"

    # Defaults to a local SQLite file so the app runs with zero extra setup.
    # Point this at a Postgres DSN (e.g. postgresql+psycopg://user:pass@host/db)
    # once Postgres is available.
    database_url: str = f"sqlite:///{BASE_DIR / 'contentos.db'}"

    secret_key: str = "dev-secret-key-change-me"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    algorithm: str = "HS256"

    # When unset, the AI service falls back to a deterministic mock generator
    # so idea/text generation works without any external API key.
    anthropic_api_key: str | None = None

    media_storage_dir: Path = BASE_DIR / "storage" / "media"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.media_storage_dir.mkdir(parents=True, exist_ok=True)
    return settings
