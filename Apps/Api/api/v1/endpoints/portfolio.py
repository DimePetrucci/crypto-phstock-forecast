from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_current_user
from core.database import get_db
from core.logging import get_logger
from models.user import User
from schemas.portfolio import PortfolioSummary
from services.portfolio.analytics import compute_portfolio_summary

router = APIRouter()
logger = get_logger(__name__)


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortfolioSummary:
    summary = await compute_portfolio_summary(db, str(current_user.id))
    if summary is None:
        raise HTTPException(status_code=404, detail="No portfolio found. Create a portfolio first.")
    return summary
