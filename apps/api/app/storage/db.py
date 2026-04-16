from __future__ import annotations

import json
from pathlib import Path

DB_DIR = Path(__file__).resolve().parents[2] / "data"
DB_DIR.mkdir(exist_ok=True)
PROFILE_FILE = DB_DIR / "profile.json"


def load_profile_json() -> dict:
    if not PROFILE_FILE.exists():
        return {}
    return json.loads(PROFILE_FILE.read_text(encoding="utf-8"))


def save_profile_json(data: dict) -> None:
    PROFILE_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
