from __future__ import annotations

from datetime import datetime, timezone

from sqlmodel import JSON, Column, Field, SQLModel


class UserProfileRecord(SQLModel, table=True):
    id: int | None = Field(default=1, primary_key=True)
    payload: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)


class OpportunityRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    title: str
    url: str
    category: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    posted_at: datetime | None = None
    score: int = 0
    reasons: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    red_flags: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)


class ProposalDraftRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    proposal: str
    angle: str
    tone: str
    source: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
