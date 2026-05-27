from __future__ import annotations
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_current_user
from core.database import get_db
from core.logging import get_logger
from models.user import User
from schemas.portfolio import (
    HoldingCreate,
    HoldingUpdate,
    HoldingWithPnL,
    PortfolioCreate,
    PortfolioRead,
    PortfolioSummary,
)
from services.portfolio.analytics import compute_portfolio_summary
from services.portfolio.service import (
    add_holding,
    create_portfolio,
    delete_holding,
    get_portfolio,
    list_portfolios,
    update_holding,
)

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=list[PortfolioRead])
async def get_portfolios(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[PortfolioRead]:
    portfolios = await list_portfolios(db, str(current_user.id))
    return [PortfolioRead.model_validate(p) for p in portfolios]


@router.post("", response_model=PortfolioRead, status_code=201)
async def create_new_portfolio(
    body: PortfolioCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortfolioRead:
    portfolio = await create_portfolio(db, str(current_user.id), body)
    return PortfolioRead.model_validate(portfolio)


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortfolioSummary:
    summary = await compute_portfolio_summary(db, str(current_user.id))
    if summary is None:
        raise HTTPException(status_code=404, detail="No portfolio found. Create a portfolio first.")
    return summary


@router.get("/{portfolio_id}/summary", response_model=PortfolioSummary)
async def get_specific_portfolio_summary(
    portfolio_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortfolioSummary:
    portfolio = await get_portfolio(db, portfolio_id, str(current_user.id))
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    from services.portfolio.analytics import compute_portfolio_summary as _compute
    from sqlalchemy import select
    from models.portfolio import Portfolio
    # Narrow compute to specific portfolio
    from services.portfolio.analytics import _get_price, _compute_holding
    from sqlalchemy import select as sa_select
    from models.portfolio import PortfolioHolding
    from decimal import Decimal

    stmt = sa_select(PortfolioHolding).where(PortfolioHolding.portfolio_id == portfolio_id)
    result = await db.execute(stmt)
    holdings = list(result.scalars().all())

    prices: dict[str, Decimal | None] = {}
    for h in holdings:
        prices[h.asset_symbol] = await _get_price(h.asset_symbol)

    _ZERO = Decimal("0")
    total_current_value = sum(
        (h.quantity * p for h in holdings if (p := prices.get(h.asset_symbol))), _ZERO
    )
    total_cost_basis = sum((h.quantity * h.avg_buy_price for h in holdings), _ZERO)
    total_unrealised_pnl = (total_current_value - total_cost_basis) if total_current_value > _ZERO else None
    total_unrealised_pnl_pct: float | None = None
    if total_unrealised_pnl is not None and total_cost_basis > _ZERO:
        total_unrealised_pnl_pct = float((total_unrealised_pnl / total_cost_basis) * 100)

    return PortfolioSummary(
        portfolio_id=portfolio.id,
        portfolio_name=portfolio.name,
        currency=portfolio.currency,
        total_cost_basis=total_cost_basis,
        total_current_value=total_current_value if total_current_value > _ZERO else None,
        total_unrealised_pnl=total_unrealised_pnl,
        total_unrealised_pnl_pct=total_unrealised_pnl_pct,
        holdings=[_compute_holding(h, prices.get(h.asset_symbol), total_current_value) for h in holdings],
        holdings_count=len(holdings),
    )


@router.post("/{portfolio_id}/holdings", response_model=HoldingWithPnL, status_code=201)
async def add_portfolio_holding(
    portfolio_id: UUID,
    body: HoldingCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HoldingWithPnL:
    portfolio = await get_portfolio(db, portfolio_id, str(current_user.id))
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    holding = await add_holding(db, portfolio_id, body)
    from services.portfolio.analytics import _get_price, _compute_holding
    from decimal import Decimal
    price = await _get_price(holding.asset_symbol)
    return _compute_holding(holding, price, Decimal("0"))


@router.patch("/{portfolio_id}/holdings/{holding_id}", response_model=HoldingWithPnL)
async def patch_portfolio_holding(
    portfolio_id: UUID,
    holding_id: UUID,
    body: HoldingUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HoldingWithPnL:
    portfolio = await get_portfolio(db, portfolio_id, str(current_user.id))
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    holding = await update_holding(db, holding_id, portfolio_id, body)
    if holding is None:
        raise HTTPException(status_code=404, detail="Holding not found.")
    from services.portfolio.analytics import _get_price, _compute_holding
    from decimal import Decimal
    price = await _get_price(holding.asset_symbol)
    return _compute_holding(holding, price, Decimal("0"))


@router.delete("/{portfolio_id}/holdings/{holding_id}", status_code=204, response_model=None)
async def remove_portfolio_holding(
    portfolio_id: UUID,
    holding_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    portfolio = await get_portfolio(db, portfolio_id, str(current_user.id))
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    deleted = await delete_holding(db, holding_id, portfolio_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Holding not found.")
