# PRODUCT_SPEC

## 1. Product
**Name:** Tasker Proposal Copilot  
**Type:** Open-source, local-first AI copilot for Tasker proposal workflows.

## 2. Problem
Freelancers spend too much manual effort repeatedly:
- scanning many job listings,
- deciding fit quickly,
- rewriting similar proposals,
- filling repetitive form fields.

## 3. Target User
A technical freelancer (engineering + automation + backend + AI) who can execute projects but wants to reduce repetitive proposal overhead.

## 4. Positioning
- Vertical workflow copilot for freelance proposals.
- **Not** a fully autonomous browser agent.
- Keeps final submission under explicit user control.

## 5. MVP Goals
1. Analyze Tasker job listings and rank fit.
2. Explain ranking with transparent reasons.
3. Generate tailored proposal drafts from profile + job context.
4. Fill proposal form fields in browser and stop before submit.

## 6. Non-goals (MVP)
- Auto submission
- CAPTCHA bypass / anti-bot evasion / stealth scraping
- Hardcoded credentials
- Mass-apply automation
- Multi-platform support
- Billing/SaaS subscription infrastructure

## 7. Scope by Phase
- **Phase 0:** specs and project docs
- **Phase 1:** monorepo scaffold + shared schemas
- **Phase 2:** backend profile/scoring/proposal APIs
- **Phase 3:** extension parsing for Tasker listing page
- **Phase 4:** proposal generation/edit UI
- **Phase 5:** fill-form workflow that blocks submission
- **Phase 6:** tests, CI, docs polish

## 8. Core User Flows
### A) Analyze jobs on Tasker cases page
1. User opens Tasker case listing page.
2. User clicks “Analyze jobs” in extension panel.
3. Extension extracts visible cards and normalizes fields.
4. Extension sends jobs to local API.
5. API returns scored ranking + reasons + red flags.
6. Extension displays ranked recommendations.

### B) Generate proposal draft
1. User selects job and clicks “Generate proposal”.
2. Extension collects detail content (or pre-extracted detail).
3. API combines job data + profile + style preferences.
4. API returns editable proposal draft and rationale.

### C) Fill form (manual final submit)
1. User clicks “Fill proposal”.
2. Extension maps draft to page form fields.
3. Extension populates fields and shows “Review before submit”.
4. Flow stops; user manually decides final submission.

## 9. Functional Requirements
- Chrome extension MV3 with popup + content script + background worker
- Tasker adapter for selectors (single source of truth)
- FastAPI backend with SQLite persistence
- Rule-based scoring + optional LLM-assisted fit analysis
- Proposal generation endpoint with deterministic fallback
- REST communication between extension and local backend
- Structured logs and transparent scoring details

## 10. User Profile Model
- name
- short_intro
- skills[]
- preferred_categories[]
- excluded_categories[]
- portfolio_links[]
- experience_summary
- rate_min / rate_max
- keywords_prioritize[]
- keywords_avoid[]
- proposal_tone
- reusable_snippets[]

## 11. Scoring (Explainable v1)
**Rule features:**
- category match
- budget match
- keyword overlap
- blacklist keyword penalties
- urgency/recency bonus (if available)

**LLM assist (optional):**
- fit summary
- confidence
- proposal angle

Return shape:
- total_score (0-100)
- feature_scores
- reasons[]
- red_flags[]
- llm_notes (if enabled)

## 12. Safety and Compliance
- Never auto-submit proposals.
- Never bypass platform protections.
- Users must comply with Tasker rules/terms.
- Generated text is assistive and requires user review.

## 13. Success Criteria (MVP)
- End-to-end vertical slice works locally:
  1) parse listing → 2) score jobs → 3) generate proposal → 4) fill form safely.
- Basic tests pass in CI.
- New contributor can run local stack from README within ~15 minutes.
