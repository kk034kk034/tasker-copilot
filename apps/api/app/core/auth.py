from __future__ import annotations

import secrets
import time


class AnonymousTokenStore:
    def __init__(self) -> None:
        self._tokens: dict[str, float] = {}

    def issue(self, ttl_seconds: int) -> tuple[str, int]:
        token = secrets.token_urlsafe(32)
        expires_at = time.time() + ttl_seconds
        self._tokens[token] = expires_at
        return token, ttl_seconds

    def is_valid(self, token: str) -> bool:
        now = time.time()
        expires_at = self._tokens.get(token)
        if expires_at is None:
            return False
        if expires_at <= now:
            self._tokens.pop(token, None)
            return False
        return True


anonymous_token_store = AnonymousTokenStore()
