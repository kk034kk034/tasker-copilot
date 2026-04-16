from __future__ import annotations

from app.models.schemas import GenerateProposalResponse, NormalizedJob, UserProfile


class ProposalService:
    def generate(self, job: NormalizedJob, profile: UserProfile) -> GenerateProposalResponse:
        intro = (
            profile.short_intro or "I build practical MVPs and production-ready automation systems."
        )
        skill_line = (
            ", ".join(profile.skills[:5])
            if profile.skills
            else "backend delivery, integrations, and automation"
        )
        angle = "Ship a scoped MVP quickly with clear milestones and measurable outcomes."

        proposal = (
            f"Hi,\n\n"
            f"I reviewed your project '{job.title}'. {self._trim(job.description, 200)}\n\n"
            f"Why I fit:\n"
            f"- {intro}\n"
            f"- Relevant focus: {skill_line}\n"
            f"- I prioritize fast feedback loops and stable delivery.\n\n"
            f"Implementation angle:\n"
            f"- Confirm scope and key success metrics\n"
            f"- Build MVP in iterative milestones\n"
            f"- Provide handoff docs and next-step recommendations\n\n"
            f"If helpful, I can share a short delivery plan "
            f"and timeline after a quick clarification."
        )

        return GenerateProposalResponse(
            proposal=proposal,
            angle=angle,
            tone=profile.proposal_tone or "concise",
            source="template",
        )

    @staticmethod
    def _trim(text: str, limit: int) -> str:
        if len(text) <= limit:
            return text
        return text[: limit - 3].rstrip() + "..."
