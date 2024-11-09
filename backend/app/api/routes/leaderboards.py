import asyncio
import json
import uuid

import redis.asyncio as redis
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings

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


class LeaderboardUpdate(BaseModel):
    score: int


async def setup_stream():
    """Create the Redis Stream and Consumer Group if they don't exist"""
    try:
        await redis_client.xgroup_create(LEADERBOARD_STREAM, LEADERBOARD_GROUP, "0", mkstream=True)
    except redis.ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise e


@router.on_event("startup")
async def startup_event():
    await setup_stream()


@router.post("/{quiz_id}/score")
async def post_leaderboard(quiz_id: str, leaderboard_in: LeaderboardUpdate, current_user: CurrentUser):
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
        # Publish an event to the Redis stream
        await redis_client.xadd(
            LEADERBOARD_STREAM,
            {"quiz_id": quiz_id, "user_id": str(current_user.id), "score": score}
        )


@router.get("/{quiz_id}")
async def get_leaderboard(*, session: SessionDep, quiz_id: uuid.UUID):
    """Get the current leaderboard for a quiz"""
    return crud.get_leaderboard(session=session, quiz_id=quiz_id)


@router.get("/all/stream", include_in_schema=False)
async def stream_all_leaderboards(request: Request):
    """Stream all leaderboard updates using Server-Sent Events"""

    async def event_generator():
        # Start reading from the Redis stream
        while True:
            if await request.is_disconnected():
                break

            try:
                events = await redis_client.xreadgroup(
                    groupname=LEADERBOARD_GROUP,
                    consumername="leaderboard_consumer",
                    streams={LEADERBOARD_STREAM: ">"},
                    count=10,
                    block=5000  # Block for up to 5 seconds
                )

                if events:
                    for stream, messages in events:
                        for message_id, message in messages:
                            quiz_id = message["quiz_id"]
                            leaderboard = await redis_client.zrevrange(
                                f"leaderboard:{quiz_id}",
                                0,
                                9,
                                withscores=True
                            )

                            data = {
                                "quiz_id": quiz_id,
                                "leaderboard": [
                                    {"rank": i + 1, "user_id": user_id, "score": score}
                                    for i, (user_id, score) in enumerate(leaderboard)
                                ]
                            }
                            yield f"data: {json.dumps(data)}\n\n"

                    # Acknowledge messages after processing
                    await redis_client.xack(LEADERBOARD_STREAM, LEADERBOARD_GROUP,
                                            *[message_id for _, messages in events for message_id, _ in messages])

                else:
                    # If no new events, periodically fetch all leaderboards
                    keys = await redis_client.keys("leaderboard:*")
                    for key in keys:
                        quiz_id = key.split(":")[1]
                        leaderboard = await redis_client.zrevrange(
                            key,
                            0,
                            9,
                            withscores=True
                        )

                        data = {
                            "quiz_id": quiz_id,
                            "leaderboard": [
                                {"rank": i + 1, "user_id": user_id, "score": score}
                                for i, (user_id, score) in enumerate(leaderboard)
                            ]
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                await asyncio.sleep(0.5)  # Sleep to reduce load on Redis

            except redis.ResponseError as e:
                print(f"Redis error: {e}")
                yield f"data: {json.dumps({'error': 'Redis error - ' + str(e)})}\n\n"
            except Exception as e:
                print(f"Error in SSE stream: {e}")
                yield f"data: {json.dumps({'error': 'Error - ' + str(e)})}\n\n"

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
