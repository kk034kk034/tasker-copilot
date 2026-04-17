from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import legacy_router, router
from app.core.config import settings
from app.storage.db import init_db

app = FastAPI(title="Tasker Copilot API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)
app.include_router(router)
app.include_router(legacy_router)


@app.middleware("http")
async def api_key_guard(request: Request, call_next):
    if settings.api_key and request.url.path not in settings.exempt_paths_from_api_key:
        if request.headers.get("X-API-Key", "") != settings.api_key:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    return await call_next(request)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
