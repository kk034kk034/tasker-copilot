from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.core.config import settings


@dataclass
class FitSummary:
    summary: str
    confidence: float
    proposal_angle: str


class LLMProvider(Protocol):
    def summarize_fit(self, *, title: str, description: str) -> FitSummary: ...


class MockLLMProvider:
    def summarize_fit(self, *, title: str, description: str) -> FitSummary:
        del description
        return FitSummary(
            summary=f"Mock analysis: '{title}' appears feasible with the current profile.",
            confidence=0.62,
            proposal_angle="Lead with similar delivery examples and a concrete milestone plan.",
        )


class OpenAICompatibleProvider:
    """MVP placeholder for an OpenAI-compatible implementation."""

    def summarize_fit(self, *, title: str, description: str) -> FitSummary:
        del description
        return FitSummary(
            summary=f"Potential fit for '{title}' based on provided profile context.",
            confidence=0.65,
            proposal_angle="Lead with relevant project outcomes and a practical delivery plan.",
        )


def get_llm_provider() -> LLMProvider:
    provider_name = settings.llm_provider.lower()

    if provider_name == "mock" or not settings.enable_llm:
        return MockLLMProvider()

    if provider_name == "openai" and settings.openai_api_key:
        return OpenAICompatibleProvider()

    return MockLLMProvider()
