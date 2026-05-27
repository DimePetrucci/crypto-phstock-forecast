from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database import get_db
from core.redis import get_redis
from core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/detailed")
async def detailed_health(db: AsyncSession = Depends(get_db)):
    checks = {"api": "healthy", "database": "unknown", "cache": "unknown"}

    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception:
        checks["database"] = "unhealthy"

    try:
        redis = await get_redis()
        await redis.ping()
        checks["cache"] = "healthy"
    except Exception:
        checks["cache"] = "unhealthy"

    overall = "healthy" if all(v == "healthy" for v in checks.values()) else "degraded"
    return {"status": overall, "checks": checks, "version": settings.APP_VERSION}
