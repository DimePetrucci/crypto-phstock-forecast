from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ws.manager import ws_manager
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.websocket("/ws/market/{channel}")
async def market_feed(websocket: WebSocket, channel: str):
    """Subscribe to real-time market data for a given channel (e.g. 'BTC', 'AAPL')."""
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
