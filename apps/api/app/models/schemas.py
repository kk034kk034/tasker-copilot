from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    name: str = ""
    short_intro: str = ""
    skills: list[str] = Field(default_factory=list)
    preferred_categories: list[str] = Field(default_factory=list)
    excluded_categories: list[str] = Field(default_factory=list)
    portfolio_links: list[str] = Field(default_factory=list)
    experience_summary: str = ""
    rate_min: int | None = None
    rate_max: int | None = None
    keywords_prioritize: list[str] = Field(default_factory=list)
    keywords_avoid: list[str] = Field(default_factory=list)
    proposal_tone: str = "concise"
    reusable_snippets: list[str] = Field(default_factory=list)


class NormalizedJob(BaseModel):
    job_id: str
    title: str
    url: str
    category: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    description: str = ""
    posted_at: datetime | None = None
    raw_text: str = ""


class JobScoreBreakdown(BaseModel):
    category: int = 0
    budget: int = 0
    keywords: int = 0
    blacklist_penalty: int = 0
    recency: int = 0


class JobAnalysis(BaseModel):
    job_id: str
    total_score: int
    breakdown: JobScoreBreakdown
    reasons: list[str] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    llm_fit_summary: str | None = None
    llm_confidence: float | None = None
    proposal_angle: str | None = None


class AnalyzeJobsRequest(BaseModel):
    jobs: list[NormalizedJob]
    profile: UserProfile | None = None


class AnalyzeJobsResponse(BaseModel):
    ranked: list[JobAnalysis]


class GenerateProposalRequest(BaseModel):
    job: NormalizedJob
    profile: UserProfile | None = None


class GenerateProposalResponse(BaseModel):
    proposal: str
    angle: str
    tone: str
    source: Literal["template", "llm"] = "template"
