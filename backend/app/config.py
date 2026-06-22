"""Application configuration loaded from environment variables / .env.

All AI-related settings are optional. When ``OPENAI_API_KEY`` is unset the
embedding and LLM services fall back to deterministic, rule-based behaviour,
so the backend runs with zero external API cost out of the box.
"""

from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Google Sheets (data source) ---
    google_sheet_id: str = ""
    # Provide ONE of the following credential sources:
    google_service_account_file: Optional[str] = None
    google_service_account_json: Optional[str] = None
    open_house_tab: str = "open_house_picks"
    leads_tab: str = "leads"

    # --- LLM chat (Anthropic Claude) + embeddings (OpenAI, optional) ---
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-haiku-4-5"  # cheapest; set to claude-opus-4-8 for max quality
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"

    # --- Email notifications (optional, graceful fallback) ---
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: Optional[str] = None
    notify_emails: str = ""  # comma-separated recipients

    # --- Server / CORS ---
    port: int = 8000
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    @property
    def ai_enabled(self) -> bool:
        """True when an LLM key is set (Anthropic for chat, OpenAI for embeddings)."""
        return bool(self.anthropic_api_key or self.openai_api_key)

    @property
    def notify_recipients(self) -> List[str]:
        return [e.strip() for e in self.notify_emails.split(",") if e.strip()]

    @property
    def email_enabled(self) -> bool:
        """True when SMTP + at least one recipient are configured."""
        return bool(
            self.smtp_host
            and self.smtp_username
            and self.smtp_password
            and self.notify_recipients
        )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
