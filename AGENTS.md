# AGENTS

## Project intent
Build an open-source **Tasker Proposal Copilot** that helps users analyze jobs, draft tailored proposals, and fill proposal forms safely (never auto-submit).

## Non-goals
- No automatic submission
- No CAPTCHA bypass / anti-bot evasion
- No stealth scraping
- No hardcoded credentials
- No mass-apply workflow
- No multi-platform support in v1

## Directory map
- `apps/api` — FastAPI backend (profile, scoring, proposal generation)
- `apps/extension` — Chrome MV3 extension (Tasker parsing + UI + form fill)
- `packages/shared` — shared TS types and contracts
- `docs` — supporting project docs
- `scripts` — helper scripts

## Run backend
```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload --port 8000
```

## Run extension
```bash
cd apps/extension
npm install
npm run build
# Load unpacked extension from apps/extension/dist in Chrome
```

## Lint / test commands
```bash
# API
cd apps/api
ruff check .
black --check .
pytest

# Extension + shared
cd apps/extension && npm run lint && npm run typecheck
cd packages/shared && npm test
```

## Engineering conventions
- Keep Tasker selectors centralized in adapter files.
- Prefer simple, explicit code over abstraction-heavy patterns.
- Return explainable scoring details; avoid hidden magic.
- Handle DOM/API failures with clear user messages.
- Never implement auto-submit behavior.

## “Done means” checklist
- [ ] Specs/docs updated
- [ ] One end-to-end local vertical slice works
- [ ] No auto-submit path exists
- [ ] Lint/tests pass locally and in CI
- [ ] Safety limitations documented in README/SECURITY
