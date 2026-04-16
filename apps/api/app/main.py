from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import legacy_router, router
from app.storage.db import init_db

app = FastAPI(title="Tasker Copilot API", version="0.1.0")
app.include_router(router)
app.include_router(legacy_router)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
