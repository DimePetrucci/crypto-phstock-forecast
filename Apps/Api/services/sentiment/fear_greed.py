from __future__ import annotations
from datetime import datetime, timezone

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from core.config import settings
from core.logging import get_logger
from schemas.sentiment import FearGreedResult

logger = get_logger(__name__)

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=10.0)
    return _client


async def close_fear_greed_client() -> None:
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


_CLASSIFICATION_MAP = {
    "Extreme Fear": "Extreme Fear",
    "Fear": "Fear",
    "Neutral": "Neutral",
    "Greed": "Greed",
    "Extreme Greed": "Extreme Greed",
}


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def fetch_fear_greed() -> FearGreedResult:
    client = _get_client()
    url = f"{settings.FEAR_GREED_API_URL}?limit=1"
    resp = await client.get(url)
    resp.raise_for_status()
    data = resp.json()

    item = data["data"][0]
    value = int(item["value"])
    raw_class = item.get("value_classification", "Neutral")
    classification = _CLASSIFICATION_MAP.get(raw_class, "Neutral")

    timestamp_raw = item.get("timestamp")
    if timestamp_raw:
        try:
            updated_at = datetime.fromtimestamp(int(timestamp_raw), tz=timezone.utc)
        except (ValueError, TypeError):
            updated_at = datetime.now(tz=timezone.utc)
    else:
        updated_at = datetime.now(tz=timezone.utc)

    logger.info("fear_greed_fetched", value=value, classification=classification)
    return FearGreedResult(value=value, classification=classification, updated_at=updated_at)
