from uuid import UUID

import redis.asyncio as redis
from fastapi import APIRouter
from pydantic import BaseModel

from app import crud
from app.api.deps import SessionDep
from app.core.config import settings
from app.models import QuizSession

router = APIRouter()

# Initialize Redis
redis_client = redis.from_url(
    settings.REDIS_URL,
    db=settings.REDIS_DB,
    socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
    decode_responses=True
)


class QuizSessionUpdate(BaseModel):
    score: int


@router.patch("/{session_id}/score", response_model=QuizSession)
async def update_score(
        *,
        session: SessionDep,
        session_id: UUID,
        quiz_session_in: QuizSessionUpdate
) -> QuizSession:
    """Update a quiz session score"""
    quiz_session = crud.update_quiz_score(
        session=session,
        session_id=session_id,
        score=quiz_session_in.score
    )

    # Check current score in Redis
    current_score = await redis_client.zscore(
        f"leaderboard:{quiz_session.quiz_id}",
        str(quiz_session.user_id)
    )

    # Update the leaderboard in Redis if the new score is higher
    if current_score is None or quiz_session_in.score > current_score:
        await redis_client.zadd(
            f"leaderboard:{quiz_session.quiz_id}",
            {str(quiz_session.user_id): quiz_session_in.score}
        )

    return quiz_session
