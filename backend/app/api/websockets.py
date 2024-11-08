import redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.deps import CurrentUser
from app.core.config import settings

from fastapi.responses import HTMLResponse

router = APIRouter()

cache = redis.from_url(
    settings.REDIS_URL,
    db=settings.REDIS_DB,
    socket_timeout=settings.REDIS_SOCKET_TIMEOUT
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h2>Your ID: <span id="ws-id"></span></h2>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var client_id = Date.now()
            document.querySelector("#ws-id").textContent = client_id;
            var ws = new WebSocket(`ws://localhost:8000/api/v1/ws/quiz/${client_id}`);
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@router.get("/")
async def get():
    return HTMLResponse(html)


@router.websocket("/quiz-sessions/{quiz_session_id}")
async def websocket_endpoint(websocket: WebSocket, quiz_session_id: str, current_user: CurrentUser):
    print(f"WebSocket connection attempt for quiz_session_id: {quiz_session_id}")
    await manager.connect(websocket)
    print(f"WebSocket connection established for quiz_session_id: {quiz_session_id}")
    try:
        while True:
            # Listen for messages from the client
            data = await websocket.receive_text()
            cache.set(f"quiz_id:{quiz_session_id}:{current_user.id}:score", data)
            # Broadcast updated leaderboard to all connected clients
            leaderboard_data = cache.get(f"quiz_id:{quiz_session_id}:leaderboard")
            if leaderboard_data:
                await manager.broadcast(leaderboard_data.decode('utf-8'))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{quiz_session_id} left the chat")
