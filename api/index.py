import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.models.score_schema import ScoreSubmission, LeaderboardResponse, LeaderboardEntry
from api.controllers.score_controller import ScoreController

app = FastAPI(
    title="BladeBound: 5 Lives Arena API",
    description="Serverless REST API for player score validation and global leaderboard sync.",
    version="1.0.0"
)

# Enable CORS for local dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/src/") or request.url.path.endswith(".html") or request.url.path == "/":
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "game": "BladeBound: 5 Lives Arena",
        "version": "1.0.0"
    }

@app.get("/favicon.ico")
@app.get("/apple-touch-icon.png")
@app.get("/apple-touch-icon-precomposed.png")
def favicon():
    from fastapi.responses import Response
    return Response(status_code=204)

@app.get("/api/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(difficulty: str = Query("all", pattern="^(easy|medium|hard|all)$")):
    return ScoreController.get_leaderboard(difficulty=difficulty)

@app.post("/api/score", response_model=LeaderboardEntry)
def submit_score(submission: ScoreSubmission):
    return ScoreController.validate_and_submit(submission)

# Local development static file serving
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_dir = os.path.join(BASE_DIR, "public")
src_dir = os.path.join(BASE_DIR, "src")

if os.path.exists(src_dir):
    app.mount("/src", StaticFiles(directory=src_dir), name="src")

if os.path.exists(public_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(public_dir, "assets")), name="assets")
    app.mount("/css", StaticFiles(directory=os.path.join(public_dir, "css")), name="css")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(public_dir, "index.html"))

    @app.get("/index.html")
    def serve_index_html():
        return FileResponse(os.path.join(public_dir, "index.html"))
