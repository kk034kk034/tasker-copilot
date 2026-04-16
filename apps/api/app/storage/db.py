from __future__ import annotations

from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.models.db_models import (
    OpportunityRecord,
    ProposalDraftRecord,
    UserProfileRecord,
)

DB_DIR = Path(__file__).resolve().parents[2] / "data"
DB_DIR.mkdir(exist_ok=True)
DEFAULT_DB_URL = f"sqlite:///{DB_DIR / 'tasker_copilot.db'}"
ENGINE = create_engine(settings.database_url or DEFAULT_DB_URL, echo=False)


def init_db() -> None:
    SQLModel.metadata.create_all(ENGINE)


def get_session() -> Session:
    return Session(ENGINE)


def load_profile_json() -> dict:
    with get_session() as session:
        record = session.get(UserProfileRecord, 1)
        return record.payload if record else {}


def save_profile_json(data: dict) -> None:
    with get_session() as session:
        record = session.get(UserProfileRecord, 1)
        if not record:
            record = UserProfileRecord(id=1, payload=data)
            session.add(record)
        else:
            record.payload = data
        session.commit()


def save_scored_opportunities(items: list[OpportunityRecord]) -> None:
    if not items:
        return
    with get_session() as session:
        for item in items:
            session.add(item)
        session.commit()


def save_proposal_draft(item: ProposalDraftRecord) -> None:
    with get_session() as session:
        session.add(item)
        session.commit()


def list_recent_opportunities(limit: int = 20) -> list[OpportunityRecord]:
    with get_session() as session:
        stmt = (
            select(OpportunityRecord)
            .order_by(OpportunityRecord.created_at.desc())
            .limit(limit)
        )
        return list(session.exec(stmt))


def list_recent_proposals(limit: int = 20) -> list[ProposalDraftRecord]:
    with get_session() as session:
        stmt = (
            select(ProposalDraftRecord)
            .order_by(ProposalDraftRecord.created_at.desc())
            .limit(limit)
        )
        return list(session.exec(stmt))
