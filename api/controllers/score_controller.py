import uuid
import datetime
import html
from fastapi import HTTPException
from api.models.score_schema import ScoreSubmission, LeaderboardResponse, LeaderboardEntry
from api.models.leaderboard_model import LeaderboardModel

class ScoreController:
    @staticmethod
    def validate_and_submit(submission: ScoreSubmission) -> LeaderboardEntry:
        # Sanitize player name
        clean_name = html.escape(submission.player_name.strip())
        if not clean_name:
            clean_name = "ANONYMOUS"
        clean_name = clean_name[:20]

        # Anti-cheat plausibility check
        # Max theoretical score: ~500 points per second plus ~2000 per kill
        max_possible_score = int(submission.survival_time * 500 + submission.kills * 2500 + 10000)
        if submission.score > max_possible_score and submission.score > 50000:
            raise HTTPException(
                status_code=400,
                detail="Score submission failed anti-cheat verification: score out of bounds for reported duration and kills."
            )

        entry_id = str(uuid.uuid4())
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        entry_dict = {
            "id": entry_id,
            "player_name": clean_name,
            "score": submission.score,
            "wave": submission.wave,
            "kills": submission.kills,
            "difficulty": submission.difficulty.value,
            "survival_time": round(submission.survival_time, 1),
            "character": submission.character,
            "created_at": created_at
        }

        entry = LeaderboardModel.add_score(entry_dict)
        return entry

    @staticmethod
    def get_leaderboard(difficulty: str = "all") -> LeaderboardResponse:
        entries = LeaderboardModel.get_leaderboard(difficulty=difficulty)
        return LeaderboardResponse(
            leaderboard=entries,
            total_entries=len(entries),
            difficulty_filter=difficulty
        )
