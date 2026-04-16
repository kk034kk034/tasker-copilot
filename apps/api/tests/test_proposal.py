from app.models.schemas import NormalizedJob, UserProfile
from app.services.proposal import ProposalService


def test_generate_proposal_contains_title_and_fit() -> None:
    job = NormalizedJob(job_id="2", title="Build AWS MVP", url="https://example.com/job/2")
    profile = UserProfile(short_intro="I build cloud MVPs", skills=["AWS", "FastAPI"])

    proposal = ProposalService().generate(job, profile)

    assert "Build AWS MVP" in proposal.proposal
    assert "Why I fit" in proposal.proposal
