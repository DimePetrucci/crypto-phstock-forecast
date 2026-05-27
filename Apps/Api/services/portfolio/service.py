from __future__ import annotations
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.portfolio import Portfolio, PortfolioHolding
from schemas.portfolio import HoldingCreate, HoldingUpdate, PortfolioCreate, PortfolioRead


async def create_portfolio(db: AsyncSession, user_id: str, data: PortfolioCreate) -> Portfolio:
    portfolio = Portfolio(
        user_id=user_id,
        name=data.name,
        description=data.description,
        currency=data.currency,
    )
    db.add(portfolio)
    await db.commit()
    await db.refresh(portfolio)
    return portfolio


async def list_portfolios(db: AsyncSession, user_id: str) -> list[Portfolio]:
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == user_id).order_by(Portfolio.created_at)
    )
    return list(result.scalars().all())


async def get_portfolio(db: AsyncSession, portfolio_id: UUID, user_id: str) -> Portfolio | None:
    result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
    )
    return result.scalars().first()


async def add_holding(
    db: AsyncSession, portfolio_id: UUID, data: HoldingCreate
) -> PortfolioHolding:
    holding = PortfolioHolding(
        portfolio_id=portfolio_id,
        asset_symbol=data.asset_symbol.upper(),
        asset_name=data.asset_name,
        market_type=data.market_type,
        quantity=data.quantity,
        avg_buy_price=data.avg_buy_price,
        exchange=data.exchange,
    )
    db.add(holding)
    await db.commit()
    await db.refresh(holding)
    return holding


async def update_holding(
    db: AsyncSession, holding_id: UUID, portfolio_id: UUID, data: HoldingUpdate
) -> PortfolioHolding | None:
    result = await db.execute(
        select(PortfolioHolding).where(
            PortfolioHolding.id == holding_id,
            PortfolioHolding.portfolio_id == portfolio_id,
        )
    )
    holding = result.scalars().first()
    if holding is None:
        return None
    if data.quantity is not None:
        holding.quantity = data.quantity  # type: ignore[assignment]
    if data.avg_buy_price is not None:
        holding.avg_buy_price = data.avg_buy_price  # type: ignore[assignment]
    if data.asset_name is not None:
        holding.asset_name = data.asset_name  # type: ignore[assignment]
    if data.exchange is not None:
        holding.exchange = data.exchange  # type: ignore[assignment]
    await db.commit()
    await db.refresh(holding)
    return holding


async def delete_holding(db: AsyncSession, holding_id: UUID, portfolio_id: UUID) -> bool:
    result = await db.execute(
        select(PortfolioHolding).where(
            PortfolioHolding.id == holding_id,
            PortfolioHolding.portfolio_id == portfolio_id,
        )
    )
    holding = result.scalars().first()
    if holding is None:
        return False
    await db.delete(holding)
    await db.commit()
    return True
