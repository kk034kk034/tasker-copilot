# Tasker Proposal Copilot (MVP)

Open-source AI copilot for **Tasker (Taiwan freelance marketplace)** proposals.

## MVP at a glance
This repo intentionally ships a narrow vertical slice:
1. Parse visible Tasker job cards.
2. Score jobs via local backend.
3. Show top recommendations in extension popup.
4. Generate one editable proposal draft.
5. Fill proposal textarea(s) only (never submit automatically).

## Clear boundaries
### Included
- Tasker-focused Chrome extension (MV3).
- FastAPI backend with SQLite persistence.
- Explainable scoring + optional LLM fit summary.
- Mock LLM provider for local development.

### Explicitly excluded
- Auto submit flows.
- CAPTCHA bypass / anti-bot evasion.
- Stealth scraping.
- Hardcoded credentials.
- Multi-platform support in v1.

## Repository structure
- `apps/api` — FastAPI backend (profile, scoring, proposal generation, SQLite)
- `apps/extension` — Chrome extension (popup/content/background/Tasker adapter)
- `packages/shared` — shared TypeScript contracts
- `docs` — supporting notes and walkthroughs

## Local setup (fresh machine)

### Prerequisites
- Python 3.11+
- Node.js 20+

### 1) Start backend
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
cp ../../.env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check:
```bash
curl http://127.0.0.1:8000/health
```

### 2) Build shared package
```bash
cd packages/shared
npm install
npm run build
```

### 3) Build extension
```bash
cd apps/extension
npm install
npm run build
```

### 4) Load unpacked extension
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `apps/extension/dist`
5. Visit Tasker cases page, open popup, click **Analyze jobs**

> Note: the manifest uses source paths (`src/...js`) emitted by TypeScript build within the project folder.

## API endpoints (MVP)
- `GET /health`
- `GET /profiles/current`
- `PUT /profiles/current`
- `POST /jobs/score`
- `POST /proposals/generate`

Legacy compatibility routes exist under `/v1`.

## Environment variables
Copy `.env.example` to `.env`.

- `API_HOST=127.0.0.1`
- `API_PORT=8000`
- `DATABASE_URL=sqlite:///apps/api/data/tasker_copilot.db`
- `ENABLE_LLM=false`
- `LLM_PROVIDER=mock`
- `OPENAI_API_KEY=`
- `OPENAI_BASE_URL=https://api.openai.com/v1`
- `OPENAI_MODEL=gpt-4o-mini`

## Tasker-specific assumptions
- Primary target pages: `https://www.tasker.com.tw/case*`
- Selector strategy is centralized in `taskerAdapter.ts`
- MVP parses only visible job cards from the current page
- DOM changes on Tasker may require adapter selector updates

## Development commands
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

## Safety
- This tool never auto-submits proposals.
- User always performs final review and submit action.
- Generated text is assistive and may be wrong; verify before use.

## Documentation
- [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AGENTS.md](./AGENTS.md)
- [SECURITY.md](./SECURITY.md)
