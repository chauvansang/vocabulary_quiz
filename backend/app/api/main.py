from fastapi import APIRouter

from app.api.routes import items, login, users, utils, quizzes, quizsessions
from app.api.websockets import router as websocket_router

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(quizsessions.router, prefix="/quiz-sessions", tags=["quiz-sessions"])
api_router.include_router(websocket_router, prefix="/ws", tags=["websocket"])

