from datetime import UTC, datetime

from app.models.schemas import NormalizedJob, UserProfile
from app.services.scoring import ScoringService


def test_scoring_prefers_keyword_and_category_matches() -> None:
    profile = UserProfile(
        preferred_categories=["Web Development"],
        keywords_prioritize=["fastapi", "automation"],
        keywords_avoid=["wordpress"],
        rate_min=20000,
    )
    job = NormalizedJob(
        job_id="1",
        title="FastAPI automation MVP",
        url="https://example.com/job/1",
        category="Web Development",
        budget_max=50000,
        description="Need backend automation work",
        posted_at=datetime.now(UTC),
    )

    result = ScoringService().analyze_jobs([job], profile)[0]

    assert result.total_score >= 70
    assert result.breakdown.category > 0
    assert result.breakdown.keywords > 0
