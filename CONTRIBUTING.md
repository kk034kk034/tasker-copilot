# Contributing

Thanks for contributing to Tasker Proposal Copilot.

## Before opening a PR
1. Read `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, and `AGENTS.md`.
2. Keep changes aligned with MVP non-goals (especially no auto-submit behavior).
3. Add/adjust tests for behavior changes.

## Local checks
- API: `ruff check . && black --check . && pytest`
- Extension: `npm run lint && npm run typecheck && npm run test`
- Shared: `npm run build && npm test`

## PR expectations
- Explain problem and approach.
- Mention safety impact if touching form-filling behavior.
- Include screenshots for extension UI changes when possible.
