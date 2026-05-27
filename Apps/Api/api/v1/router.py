from fastapi import APIRouter
from api.v1.endpoints import auth, health, market, sentiment, intelligence, alerts, watchlist, portfolio

router = APIRouter()

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(market.router, prefix="/market", tags=["market"])
router.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
router.include_router(intelligence.router, prefix="/intelligence", tags=["intelligence"])
router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])
router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
