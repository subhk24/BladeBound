from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class DifficultyEnum(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class CharacterEnum(str, Enum):
    FEMALE = "female"
    MALE = "male"

class ScoreSubmission(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=20, description="Player name or arcade tag")
    score: int = Field(..., ge=0, description="Total combat survival score")
    wave: int = Field(..., ge=1, description="Highest wave reached")
    kills: int = Field(..., ge=0, description="Total enemies eliminated")
    difficulty: DifficultyEnum = Field(default=DifficultyEnum.MEDIUM, description="Game difficulty level")
    survival_time: float = Field(..., ge=0, description="Survival time in seconds")
    character: str = Field(default="female", description="Hero archetype used")

class LeaderboardEntry(ScoreSubmission):
    id: str
    rank: Optional[int] = None
    created_at: str

class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    total_entries: int
    difficulty_filter: Optional[str] = "all"
