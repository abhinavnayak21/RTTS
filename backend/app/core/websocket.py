import json
import logging
from typing import Any
from fastapi import WebSocket

logger = logging.getLogger("websocket")


class ConnectionManager:
    def __init__(self):
        # List of connection dicts: {"websocket": WebSocket, "user_id": int, "role": str}
        self.connections: list[dict[str, Any]] = []

    async def connect(self, websocket: WebSocket, user_id: int, role: str):
        await websocket.accept()
        self.connections.append({
            "websocket": websocket,
            "user_id": user_id,
            "role": role.lower(),
        })
        logger.info(f"WebSocket client connected: user_id={user_id}, role={role}. Total active: {len(self.connections)}")

    def disconnect(self, websocket: WebSocket):
        self.connections = [
            conn for conn in self.connections if conn["websocket"] != websocket
        ]
        logger.info(f"WebSocket client disconnected. Total active: {len(self.connections)}")

    async def broadcast(
        self,
        event: str,
        data: dict[str, Any],
        target_user_id: int | None = None,
    ):
        message = json.dumps({"event": event, "data": data})
        dead_connections = []

        for conn in self.connections:
            ws: WebSocket = conn["websocket"]
            role = conn["role"]
            user_id = conn["user_id"]

            # Admins receive all ticket events.
            # Customers receive events where they are target_user_id or if target_user_id is None (broadcast).
            should_send = (
                role == "admin"
                or target_user_id is None
                or str(user_id) == str(target_user_id)
            )

            if should_send:
                try:
                    await ws.send_text(message)
                except Exception as e:
                    logger.warning(f"Failed to send to client user_id={user_id}: {e}")
                    dead_connections.append(ws)

        for dead_ws in dead_connections:
            self.disconnect(dead_ws)


ws_manager = ConnectionManager()
