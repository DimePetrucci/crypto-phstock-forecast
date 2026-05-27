from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from core.config import settings
from core.logging import configure_logging, get_logger
from core.database import init_db, close_db
from core.redis import close_redis
from core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
)
from api.v1.router import router as v1_router
from ws.routes import router as ws_router
from ws.broadcaster import start_market_broadcaster
from services.market.binance_rest import close_binance_rest
from services.market.coingecko import close_coingecko

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup_begin", version=settings.APP_VERSION, env=settings.ENVIRONMENT)
    await init_db()
    broadcaster_task = await start_market_broadcaster()
    yield
    logger.info("shutdown_begin")
    broadcaster_task.cancel()
    try:
        await broadcaster_task
    except Exception:
        pass
    await close_binance_rest()
    await close_coingecko()
    await close_db()
    await close_redis()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not settings.DEBUG:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Routes
app.include_router(v1_router, prefix=settings.API_V1_PREFIX)
app.include_router(ws_router)
