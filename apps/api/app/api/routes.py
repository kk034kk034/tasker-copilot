from __future__ import annotations

from fastapi import APIRouter

from app.models.schemas import (
    AnalyzeJobsRequest,
    AnalyzeJobsResponse,
    GenerateProposalRequest,
    GenerateProposalResponse,
    UserProfile,
)
from app.services.proposal import ProposalService
from app.services.scoring import ScoringService
from app.storage.db import load_profile_json, save_profile_json

router = APIRouter(prefix="/v1")


@router.get("/profile", response_model=UserProfile)
def get_profile() -> UserProfile:
    data = load_profile_json()
    return UserProfile(**data) if data else UserProfile()


@router.put("/profile", response_model=UserProfile)
def put_profile(profile: UserProfile) -> UserProfile:
    save_profile_json(profile.model_dump())
    return profile


@router.post("/jobs/analyze", response_model=AnalyzeJobsResponse)
def analyze_jobs(payload: AnalyzeJobsRequest) -> AnalyzeJobsResponse:
    profile = payload.profile or get_profile()
    scored = ScoringService().analyze_jobs(payload.jobs, profile)
    return AnalyzeJobsResponse(ranked=scored)


@router.post("/proposals/generate", response_model=GenerateProposalResponse)
def generate_proposal(payload: GenerateProposalRequest) -> GenerateProposalResponse:
    profile = payload.profile or get_profile()
    return ProposalService().generate(payload.job, profile)
