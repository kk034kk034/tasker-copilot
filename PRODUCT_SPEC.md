# PRODUCT_SPEC

## 1. Product
**Name:** Tasker Proposal Copilot  
**Type:** Open-source, local-first AI copilot for Tasker proposal workflows (not an autonomous agent).

## 2. Problem
Freelancers repeatedly spend time on:
- scanning many Tasker listings,
- deciding fit quickly,
- rewriting similar proposals,
- filling repetitive proposal form fields.

## 3. Target User (MVP)
A technically capable freelancer who can deliver software/automation projects, but wants to reduce repetitive proposal overhead while keeping full control of final submission.

## 4. MVP Boundary (what is in vs out)
### In scope (must ship)
1. Parse **visible** Tasker job cards on cases/listing pages.
2. Send normalized jobs to local backend.
3. Score jobs with explainable rule-based logic.
4. Render top recommendations in extension popup.
5. Generate one editable proposal draft from selected job + profile.
6. Fill proposal textarea(s) only; **stop before submit**.

### Out of scope (must not ship)
- Auto submission or hidden click/submit triggers.
- CAPTCHA bypass / anti-bot evasion / stealth scraping.
- Hardcoded credentials.
- Mass-apply workflows.
- Multi-platform adapters in v1.

## 5. Responsibilities by component
### Extension (apps/extension)
- Tasker page parsing (DOM selectors centralized in adapter).
- User interaction (analyze / generate / fill actions).
- Display scoring results and errors.
- Form-fill helper that never submits.

### Backend (apps/api)
- Profile storage and retrieval.
- Job scoring and ranked response.
- Proposal generation.
- LLM provider abstraction + mock provider for local dev.
- Persistence of profile/opportunity/proposal draft records in SQLite.

## 6. Tasker-specific assumptions (explicit)
- Initial target pages are `https://www.tasker.com.tw/case*`.
- Job cards contain title, link, and often budget/category text, but selectors can drift.
- MVP only parses currently visible cards (no infinite-scroll crawling).
- Language mix (Traditional Chinese + English) is expected in titles/descriptions.
- Users must review generated content for correctness and policy compliance.

## 7. Core User Flows
### A) Analyze jobs
1. User opens Tasker cases page.
2. User clicks **Analyze jobs** in popup.
3. Content script extracts visible cards via Tasker adapter.
4. Background sends normalized jobs to backend `/jobs/score`.
5. Backend returns ranked scores + reasons + red flags.
6. Popup renders top recommendations.

### B) Generate proposal draft
1. User chooses a scored job.
2. User clicks **Generate proposal**.
3. Backend returns editable draft and proposal angle.

### C) Fill form safely
1. User clicks **Fill proposal**.
2. Extension writes text to proposal textarea(s).
3. Extension shows review reminder and stops.
4. User manually decides whether to submit.

## 8. Data Models (MVP)
- `UserProfile`
- `Opportunity`
- `ProposalDraft`
- `NormalizedJob` (request payload model)

## 9. Success Criteria (MVP)
- One local end-to-end flow works: parse → score → render top jobs.
- Proposal generation works from selected job.
- No auto-submit path exists.
- Basic scoring tests pass.
- New contributor can run locally from README in ~15 minutes.
