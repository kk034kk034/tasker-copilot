from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import legacy_router, router
from app.core.auth import anonymous_token_store
from app.core.config import settings
from app.storage.db import init_db

app = FastAPI(title="Tasker Copilot API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key", "Authorization"],
)
app.include_router(router)
app.include_router(legacy_router)


@app.middleware("http")
async def api_key_guard(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    if request.url.path in settings.exempt_paths_from_api_key or request.url.path == "/auth/anonymous":
        return await call_next(request)

    header_api_key = request.headers.get("X-API-Key", "").strip()
    if settings.api_key and header_api_key == settings.api_key:
        return await call_next(request)

    if settings.enable_anonymous_token_auth:
        authorization = request.headers.get("Authorization", "")
        if authorization.startswith("Bearer "):
            token = authorization[7:].strip()
            if token and anonymous_token_store.is_valid(token):
                return await call_next(request)

    if settings.api_key and header_api_key:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    if settings.enable_anonymous_token_auth:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    if settings.api_key:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    return await call_next(request)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
