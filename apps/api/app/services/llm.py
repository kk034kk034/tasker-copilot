from __future__ import annotations

from app.core.config import settings


class LLMClient:
    """Minimal provider abstraction for an OpenAI-compatible API."""

    def is_enabled(self) -> bool:
        return settings.enable_llm and bool(settings.openai_api_key)

    def summarize_fit(self, *, title: str, description: str) -> tuple[str, float, str]:
        if not self.is_enabled():
            return (
                "LLM disabled; using rule-based scoring only.",
                0.35,
                "Highlight direct skill alignment.",
            )

        # MVP: deterministic placeholder until provider call is wired.
        # Keep this explicit for easier local development and predictable tests.
        return (
            f"Potential fit for '{title}' based on provided profile context.",
            0.65,
            "Lead with relevant project outcomes and a practical delivery plan.",
        )
