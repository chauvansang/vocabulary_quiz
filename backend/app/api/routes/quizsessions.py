import asyncio
import json
from uuid import UUID

import redis.asyncio as redis
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel

from app import crud
from app.api.deps import SessionDep, CurrentUser
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

LEADERBOARD_STREAM = "quiz_leaderboard_events"
LEADERBOARD_GROUP = "quiz_leaderboard_group"


class QuizSessionUpdate(BaseModel):
    score: int


async def setup_stream():
    """Create the Redis Stream and Consumer Group if they don't exist"""
    try:
        await redis_client.xgroup_create(LEADERBOARD_STREAM, LEADERBOARD_GROUP, "0", mkstream=True)
    except redis.ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise e


@router.get("/leaderboard/{quiz_id}")
async def get_leaderboard(quiz_id: str):
    """Get the current leaderboard for a quiz"""
    leaderboard = await redis_client.zrevrange(
        f"leaderboard:{quiz_id}",
        0,
        9,
        withscores=True
    )

    return [
        {"rank": i + 1, "user_id": user_id, "score": score}
        for i, (user_id, score) in enumerate(leaderboard)
    ]


@router.get("/leaderboard/{quiz_id}/stream", include_in_schema=False)
async def stream_leaderboard(quiz_id: str, request: Request):
    """Stream leaderboard updates using Server-Sent Events"""

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break

                # Get current leaderboard
                leaderboard = await redis_client.zrevrange(
                    f"leaderboard:{quiz_id}",
                    0,
                    9,
                    withscores=True
                )

                data = [
                    {"rank": i + 1, "user_id": user_id, "score": score}
                    for i, (user_id, score) in enumerate(leaderboard)
                ]

                yield f"data: {json.dumps(data)}\n\n"
                await asyncio.sleep(5)

        except Exception as e:
            print(f"Error in SSE stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Transfer-Encoding": "chunked",
            "X-Accel-Buffering": "no",  # Disable buffering in Nginx
        }
    )


# Add an OPTIONS endpoint to handle preflight requests
@router.options("/leaderboard/{quiz_id}/stream")
async def stream_leaderboard_options(quiz_id: str):
    return Response(
        content="",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )


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


@router.post("/leaderboard/{quiz_id}/score")
async def post_leaderboard(quiz_id: str, leaderboard_in: QuizSessionUpdate, current_user: CurrentUser):
    score = leaderboard_in.score
    current_score = await redis_client.zscore(
        f"leaderboard:{quiz_id}",
        str(current_user.id)
    )

    if current_score is None or score > current_score:
        await redis_client.zadd(
            f"leaderboard:{quiz_id}",
            {str(current_user.id): score}
        )


@router.on_event("startup")
async def startup_event():
    await setup_stream()
