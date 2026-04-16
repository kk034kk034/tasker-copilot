from __future__ import annotations

from datetime import UTC, datetime

from app.models.schemas import JobAnalysis, JobScoreBreakdown, NormalizedJob, UserProfile
from app.services.llm import LLMClient


class ScoringService:
    def __init__(self) -> None:
        self.llm = LLMClient()

    def analyze_jobs(self, jobs: list[NormalizedJob], profile: UserProfile) -> list[JobAnalysis]:
        analyzed = [self._analyze_job(job, profile) for job in jobs]
        return sorted(analyzed, key=lambda item: item.total_score, reverse=True)

    def _analyze_job(self, job: NormalizedJob, profile: UserProfile) -> JobAnalysis:
        breakdown = JobScoreBreakdown()
        reasons: list[str] = []
        red_flags: list[str] = []

        category = (job.category or "").lower()
        title_desc = f"{job.title} {job.description} {job.raw_text}".lower()

        if category and category in [c.lower() for c in profile.preferred_categories]:
            breakdown.category = 25
            reasons.append("Category matches preferred categories.")

        if category and category in [c.lower() for c in profile.excluded_categories]:
            breakdown.blacklist_penalty -= 30
            red_flags.append("Category appears in excluded categories.")

        has_budget_and_rate = job.budget_max is not None and profile.rate_min is not None
        if has_budget_and_rate and job.budget_max >= profile.rate_min:
            breakdown.budget = 20
            reasons.append("Budget range can satisfy minimum rate target.")
        elif has_budget_and_rate:
            breakdown.budget = -10
            red_flags.append("Budget may be below your preferred minimum rate.")

        keyword_hits = sum(
            1
            for keyword in profile.keywords_prioritize
            if keyword.lower() in title_desc
        )
        breakdown.keywords = min(keyword_hits * 8, 24)
        if keyword_hits:
            reasons.append(f"Matched {keyword_hits} prioritized keyword(s).")

        avoid_hits = sum(1 for keyword in profile.keywords_avoid if keyword.lower() in title_desc)
        if avoid_hits:
            penalty = min(avoid_hits * 12, 36)
            breakdown.blacklist_penalty -= penalty
            red_flags.append(f"Found {avoid_hits} avoid-keyword match(es).")

        if job.posted_at:
            age_hours = (datetime.now(UTC) - job.posted_at).total_seconds() / 3600
            if age_hours <= 24:
                breakdown.recency = 8
                reasons.append("Recently posted opportunity.")

        llm_fit_summary, llm_confidence, proposal_angle = self.llm.summarize_fit(
            title=job.title,
            description=job.description,
        )

        total = max(
            0,
            min(
                100,
                breakdown.category
                + breakdown.budget
                + breakdown.keywords
                + breakdown.blacklist_penalty
                + breakdown.recency
                + 30,
            ),
        )

        return JobAnalysis(
            job_id=job.job_id,
            total_score=total,
            breakdown=breakdown,
            reasons=reasons,
            red_flags=red_flags,
            llm_fit_summary=llm_fit_summary,
            llm_confidence=llm_confidence,
            proposal_angle=proposal_angle,
        )
