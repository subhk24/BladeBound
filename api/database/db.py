import os
import json
import threading
from typing import List, Dict, Any

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DB_DIR, "leaderboard.json")

DEFAULT_SCORES = [
    {
        "id": "seed-1",
        "player_name": "VALKYRIE_99",
        "score": 18450,
        "wave": 14,
        "kills": 86,
        "difficulty": "hard",
        "survival_time": 420.5,
        "character": "female",
        "created_at": "2026-09-08T18:30:00Z"
    },
    {
        "id": "seed-2",
        "player_name": "SHADOW_BLADE",
        "score": 14200,
        "wave": 11,
        "kills": 64,
        "difficulty": "medium",
        "survival_time": 330.2,
        "character": "female",
        "created_at": "2026-09-08T20:15:00Z"
    },
    {
        "id": "seed-3",
        "player_name": "IRON_KNIGHT",
        "score": 12850,
        "wave": 10,
        "kills": 58,
        "difficulty": "hard",
        "survival_time": 295.0,
        "character": "male",
        "created_at": "2026-09-09T02:10:00Z"
    },
    {
        "id": "seed-4",
        "player_name": "GLADIATOR",
        "score": 9600,
        "wave": 8,
        "kills": 42,
        "difficulty": "medium",
        "survival_time": 240.8,
        "character": "male",
        "created_at": "2026-09-09T08:45:00Z"
    },
    {
        "id": "seed-5",
        "player_name": "ROOKIE_SLAYER",
        "score": 5300,
        "wave": 5,
        "kills": 25,
        "difficulty": "easy",
        "survival_time": 180.0,
        "character": "female",
        "created_at": "2026-09-09T14:20:00Z"
    }
]

_lock = threading.RLock()

def get_all_records() -> List[Dict[str, Any]]:
    with _lock:
        if not os.path.exists(DB_FILE):
            save_all_records(DEFAULT_SCORES)
            return list(DEFAULT_SCORES)
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return list(DEFAULT_SCORES)

def save_all_records(records: List[Dict[str, Any]]) -> None:
    # Notice: In Vercel serverless functions, filesystem writes outside /tmp may be read-only.
    # We attempt write; if /api is read-only, we gracefully catch or write to /tmp.
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)
    except OSError:
        tmp_file = os.path.join("/tmp", "leaderboard.json")
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)

def append_record(record: Dict[str, Any]) -> None:
    with _lock:
        records = get_all_records()
        records.append(record)
        # Keep top 100
        records.sort(key=lambda r: r.get("score", 0), reverse=True)
        records = records[:100]
        save_all_records(records)
