import logging
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.jwt import verify_access_token
from app.core.websocket import ws_manager
from app.db.session import SessionLocal
from app.models.user import User

logger = logging.getLogger("websocket")

router = APIRouter(
    tags=["WebSocket"],
)


@router.websocket("/ws/tickets")
async def websocket_tickets_endpoint(
    websocket: WebSocket,
    token: str | None = Query(None),
):
    if not token:
        logger.warning("WebSocket rejected: no token provided")
        await websocket.close(code=1008)  # Policy Violation
        return

    payload = verify_access_token(token)
    if not payload or not payload.get("sub"):
        logger.warning("WebSocket rejected: invalid token")
        await websocket.close(code=1008)
        return

    email = payload.get("sub")
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"WebSocket rejected: user {email} not found")
            await websocket.close(code=1008)
            return

        user_id = user.id
        role = user.role
    finally:
        db.close()

    await ws_manager.connect(websocket, user_id=user_id, role=role)

    try:
        while True:
            # Keep connection alive and receive ping / messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
