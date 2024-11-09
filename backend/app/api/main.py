from fastapi import APIRouter

from app.api.routes import items, login, users, utils, quizzes, quizsessions, leaderboards

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(quizsessions.router, prefix="/quiz-sessions", tags=["quiz-sessions"])
api_router.include_router(leaderboards.router, prefix="/leaderboards", tags=["leaderboards"])

