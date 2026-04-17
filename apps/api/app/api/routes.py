from __future__ import annotations

from fastapi import APIRouter

from app.models.db_models import OpportunityRecord, ProposalDraftRecord
from app.models.schemas import (
    AnalyzeJobsRequest,
    AnalyzeJobsResponse,
    GenerateProposalRequest,
    GenerateProposalResponse,
    UserProfile,
)
from app.core.auth import anonymous_token_store
from app.core.config import settings
from app.services.proposal import ProposalService
from app.services.scoring import ScoringService
from app.storage.db import (
    load_profile_json,
    save_profile_json,
    save_proposal_draft,
    save_scored_opportunities,
)

router = APIRouter()
legacy_router = APIRouter(prefix="/v1")


def get_current_profile() -> UserProfile:
    data = load_profile_json()
    return UserProfile(**data) if data else UserProfile()


def update_current_profile(profile: UserProfile) -> UserProfile:
    save_profile_json(profile.model_dump())
    return profile


def score_jobs(payload: AnalyzeJobsRequest) -> AnalyzeJobsResponse:
    profile = payload.profile or get_current_profile()
    scored = ScoringService().analyze_jobs(payload.jobs, profile)
    jobs_by_id = {job.job_id: job for job in payload.jobs}

    opportunities: list[OpportunityRecord] = []
    for analysis in scored:
        job = jobs_by_id.get(analysis.job_id)
        opportunities.append(
            OpportunityRecord(
                job_id=analysis.job_id,
                title=job.title if job else analysis.job_id,
                url=job.url if job else "",
                category=job.category if job else None,
                budget_min=job.budget_min if job else None,
                budget_max=job.budget_max if job else None,
                posted_at=job.posted_at if job else None,
                score=analysis.total_score,
                reasons=analysis.reasons,
                red_flags=analysis.red_flags,
            )
        )

    save_scored_opportunities(opportunities)
    return AnalyzeJobsResponse(ranked=scored)


def generate_proposal(payload: GenerateProposalRequest) -> GenerateProposalResponse:
    profile = payload.profile or get_current_profile()
    generated = ProposalService().generate(payload.job, profile)
    save_proposal_draft(
        ProposalDraftRecord(
            job_id=payload.job.job_id,
            proposal=generated.proposal,
            angle=generated.angle,
            tone=generated.tone,
            source=generated.source,
        )
    )
    return generated


@router.get("/profiles/current", response_model=UserProfile)
def get_profile_current() -> UserProfile:
    return get_current_profile()


@router.put("/profiles/current", response_model=UserProfile)
def put_profile_current(profile: UserProfile) -> UserProfile:
    return update_current_profile(profile)


@router.post("/jobs/score", response_model=AnalyzeJobsResponse)
def post_jobs_score(payload: AnalyzeJobsRequest) -> AnalyzeJobsResponse:
    return score_jobs(payload)


@router.post("/proposals/generate", response_model=GenerateProposalResponse)
def post_generate_proposal(payload: GenerateProposalRequest) -> GenerateProposalResponse:
    return generate_proposal(payload)


@router.post("/auth/anonymous")
def post_auth_anonymous() -> dict[str, int | str]:
    token, expires_in = anonymous_token_store.issue(settings.anonymous_token_ttl_seconds)
    return {"token": token, "token_type": "Bearer", "expires_in": expires_in}


@legacy_router.get("/profile", response_model=UserProfile)
def get_profile_v1() -> UserProfile:
    return get_current_profile()


@legacy_router.put("/profile", response_model=UserProfile)
def put_profile_v1(profile: UserProfile) -> UserProfile:
    return update_current_profile(profile)


@legacy_router.post("/jobs/analyze", response_model=AnalyzeJobsResponse)
def post_jobs_analyze_v1(payload: AnalyzeJobsRequest) -> AnalyzeJobsResponse:
    return score_jobs(payload)


@legacy_router.post("/proposals/generate", response_model=GenerateProposalResponse)
def post_generate_proposal_v1(payload: GenerateProposalRequest) -> GenerateProposalResponse:
    return generate_proposal(payload)
