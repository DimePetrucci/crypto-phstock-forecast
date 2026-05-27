from __future__ import annotations
from core.redis import get_redis


async def acquire_job_lock(job_id: str, ttl_seconds: int) -> bool:
    """Returns True if this worker acquired the lock (should run the job).
    Uses Redis SET NX EX to guarantee only one worker runs per interval."""
    client = await get_redis()
    key = f"scheduler:lock:{job_id}"
    acquired = await client.set(key, "1", nx=True, ex=ttl_seconds)
    return bool(acquired)
