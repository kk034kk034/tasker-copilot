# AGENTS

## Project intent
Build an open-source **Tasker Proposal Copilot** that helps users:
1. analyze Tasker jobs,
2. draft tailored proposals,
3. fill proposal forms safely (**never auto-submit**).

## MVP boundaries (must stay tight)
### Must do
- Parse visible Tasker job cards from listing pages.
- Send normalized jobs to local backend for scoring.
- Show ranked recommendations with reasons/red flags.
- Generate editable proposal drafts.
- Fill form fields only and stop before submit.

### Must NOT do
- Automatic submission behavior.
- CAPTCHA bypass, anti-bot evasion, stealth scraping.
- Hardcoded credentials/secrets.
- Mass-apply workflows.
- Multi-platform adapters in v1.

## Responsibility split
- `apps/api` — FastAPI backend (profile persistence, scoring, proposal generation, LLM abstraction)
- `apps/extension` — Chrome MV3 extension (Tasker parse, popup UX, safe form fill)
- `packages/shared` — shared TypeScript contracts
- `docs` — product/architecture/dev docs

## Tasker-specific assumptions
- Initial scope is `https://www.tasker.com.tw/case*` listings.
- DOM selectors can drift; keep selector logic centralized in adapter modules.
- MVP parses only visible cards; no crawl/auto-scroll behavior.
- Always surface parser/API failures with clear user-facing messages.

## Local development quickstart
### Backend
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
cp ../../.env.example .env
uvicorn app.main:app --reload --port 8000
```

### Shared + extension
```bash
cd packages/shared && npm install && npm run build
cd apps/extension && npm install && npm run build
# Load unpacked from apps/extension/dist in chrome://extensions
```

## Lint / test commands
```bash
# API
cd apps/api
ruff check .
black --check .
pytest

# Extension
cd apps/extension
npm run lint
npm run typecheck
npm test

# Shared
cd packages/shared
npm test
```

## Engineering conventions
- Keep Tasker selectors centralized in adapter files.
- Prefer explicit, readable logic over abstraction-heavy patterns.
- Return explainable scoring details (feature-level reasons/flags).
- Handle DOM/API failures gracefully and visibly.
- Never implement auto-submit paths.

## "Done means" checklist
- [ ] Specs/docs updated
- [ ] One local end-to-end vertical slice works (parse → score → render)
- [ ] No auto-submit path exists
- [ ] Lint/tests pass locally and in CI
- [ ] Safety limitations documented in README/SECURITY
