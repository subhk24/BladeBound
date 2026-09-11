import sys
import os

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from api.models.score_schema import ScoreSubmission, DifficultyEnum
from api.controllers.score_controller import ScoreController
from api.models.leaderboard_model import LeaderboardModel

def test_api():
    print("Testing Pydantic models & validation...")
    sub = ScoreSubmission(
        player_name="TEST_HERO",
        score=7500,
        wave=6,
        kills=35,
        difficulty=DifficultyEnum.MEDIUM,
        survival_time=185.4,
        character="female"
    )
    assert sub.player_name == "TEST_HERO"
    assert sub.score == 7500
    print("✓ ScoreSubmission valid.")

    print("Testing ScoreController submission...")
    entry = ScoreController.validate_and_submit(sub)
    assert entry.id is not None
    assert entry.player_name == "TEST_HERO"
    print(f"✓ Submission recorded with ID={entry.id}, rank={entry.rank}")

    print("Testing Leaderboard retrieval...")
    res = ScoreController.get_leaderboard(difficulty="medium")
    assert res.total_entries >= 1
    found = any(e.player_name == "TEST_HERO" for e in res.leaderboard)
    assert found, "Submitted score must be in leaderboard"
    print(f"✓ Leaderboard returned {res.total_entries} entries, TEST_HERO verified.")

    # Check anti-cheat exception
    print("Testing Anti-cheat detection...")
    try:
        cheat_sub = ScoreSubmission(
            player_name="HACKER",
            score=9999999, # Impossible for 5 seconds survival
            wave=1,
            kills=0,
            difficulty=DifficultyEnum.HARD,
            survival_time=5.0
        )
        ScoreController.validate_and_submit(cheat_sub)
        assert False, "Should have raised HTTPException for impossible score!"
    except Exception as e:
        print(f"✓ Anti-cheat successfully blocked impossible score: {e}")

    print("\nAll Backend API Tests Passed!")

if __name__ == '__main__':
    test_api()
