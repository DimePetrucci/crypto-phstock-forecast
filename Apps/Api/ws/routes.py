from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ws.manager import ws_manager
from core.logging import get_logger
from core.security import decode_token

logger = get_logger(__name__)

router = APIRouter()


@router.websocket("/ws/market/{channel}")
async def market_feed(websocket: WebSocket, channel: str):
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error("ws_error", channel=channel, error=str(e))
        await ws_manager.disconnect(websocket, channel)


@router.websocket("/ws/intelligence/{symbol}")
async def intelligence_feed(websocket: WebSocket, symbol: str):
    channel = f"intelligence:{symbol.upper()}"
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error("ws_intelligence_error", symbol=symbol, error=str(e))
        await ws_manager.disconnect(websocket, channel)


@router.websocket("/ws/sentiment")
async def sentiment_feed(websocket: WebSocket):
    channel = "sentiment"
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error("ws_sentiment_error", error=str(e))
        await ws_manager.disconnect(websocket, channel)


@router.websocket("/ws/alerts")
async def alerts_feed(websocket: WebSocket, token: str | None = None):
    if not token:
        await websocket.close(code=4001)
        return

    try:
        payload = decode_token(token)
    except ValueError:
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001)
        return

    channel = f"alerts:user:{user_id}"
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error("ws_alerts_error", user_id=user_id, error=str(e))
        await ws_manager.disconnect(websocket, channel)
