from typing import List, Optional, Dict, Any
from api.models.score_schema import LeaderboardEntry, DifficultyEnum
from api.database.db import get_all_records, append_record

class LeaderboardModel:
    @staticmethod
    def get_leaderboard(difficulty: Optional[str] = None) -> List[LeaderboardEntry]:
        records = get_all_records()
        if difficulty and difficulty != "all":
            records = [r for r in records if r.get("difficulty") == difficulty]

        # Sort descending by score
        records.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        entries = []
        for idx, rec in enumerate(records):
            entry = LeaderboardEntry(
                id=rec.get("id", str(idx)),
                rank=idx + 1,
                player_name=rec.get("player_name", "ANONYMOUS"),
                score=rec.get("score", 0),
                wave=rec.get("wave", 1),
                kills=rec.get("kills", 0),
                difficulty=DifficultyEnum(rec.get("difficulty", "medium")),
                survival_time=rec.get("survival_time", 0.0),
                character=rec.get("character", "female"),
                created_at=rec.get("created_at", "")
            )
            entries.append(entry)
        return entries

    @staticmethod
    def add_score(entry_data: Dict[str, Any]) -> LeaderboardEntry:
        append_record(entry_data)
        leaderboard = LeaderboardModel.get_leaderboard(entry_data.get("difficulty"))
        for entry in leaderboard:
            if entry.id == entry_data["id"]:
                return entry
        return LeaderboardEntry(**entry_data, rank=1)
