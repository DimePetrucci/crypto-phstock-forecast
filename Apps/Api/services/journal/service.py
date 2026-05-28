from __future__ import annotations
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.trade import Trade
from schemas.trade import TradeCreate, TradeUpdate


async def _update_avg_price(db: AsyncSession, portfolio_id: UUID, symbol: str, new_qty: Decimal, new_price: Decimal) -> None:
    """Recalculate weighted average buy price for a holding after a new buy trade."""
    from models.portfolio import PortfolioHolding
    result = await db.execute(
        select(PortfolioHolding).where(
            PortfolioHolding.portfolio_id == portfolio_id,
            PortfolioHolding.asset_symbol == symbol,
        )
    )
    holding = result.scalars().first()
    if holding is None:
        return
    old_qty = Decimal(str(holding.quantity))
    old_avg = Decimal(str(holding.avg_buy_price))
    total_qty = old_qty + new_qty
    if total_qty > 0:
        holding.avg_buy_price = (old_qty * old_avg + new_qty * new_price) / total_qty


async def create_trade(db: AsyncSession, user_id: str, data: TradeCreate) -> Trade:
    from models.portfolio import Portfolio
    result = await db.execute(
        select(Portfolio).where(Portfolio.id == data.portfolio_id, Portfolio.user_id == user_id)
    )
    if result.scalars().first() is None:
        raise ValueError("Portfolio not found or does not belong to user.")

    trade = Trade(
        portfolio_id=data.portfolio_id,
        asset_symbol=data.asset_symbol.upper(),
        asset_name=data.asset_name,
        market_type=data.market_type,
        exchange=data.exchange,
        trade_type=data.trade_type,
        buy_price=data.buy_price,
        sell_price=data.sell_price,
        quantity=data.quantity,
        position_size=data.position_size,
        fees_paid=data.fees_paid,
        currency=data.currency,
        entry_at=data.entry_at,
        exit_at=data.exit_at,
        pnl_amount=data.pnl_amount,
        pnl_percentage=data.pnl_percentage,
        break_even_price=data.break_even_price,
        notes=data.notes,
        strategy_tags=data.strategy_tags,
        investment_amount=data.investment_amount,
        category=data.category,
    )
    db.add(trade)

    # Auto-update weighted average price when recording a buy
    if data.trade_type == "buy" and data.buy_price:
        await _update_avg_price(db, data.portfolio_id, data.asset_symbol.upper(), data.quantity, data.buy_price)

    await db.commit()
    await db.refresh(trade)
    return trade


async def list_trades(
    db: AsyncSession, user_id: str, limit: int = 100, offset: int = 0
) -> list[Trade]:
    from models.portfolio import Portfolio
    subq = select(Portfolio.id).where(Portfolio.user_id == user_id)
    result = await db.execute(
        select(Trade)
        .where(Trade.portfolio_id.in_(subq))
        .order_by(Trade.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def get_trade(db: AsyncSession, trade_id: UUID, user_id: str) -> Trade | None:
    from models.portfolio import Portfolio
    subq = select(Portfolio.id).where(Portfolio.user_id == user_id)
    result = await db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.portfolio_id.in_(subq))
    )
    return result.scalars().first()


async def update_trade(
    db: AsyncSession, trade_id: UUID, user_id: str, data: TradeUpdate
) -> Trade | None:
    trade = await get_trade(db, trade_id, user_id)
    if trade is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(trade, field, value)
    await db.commit()
    await db.refresh(trade)
    return trade


async def delete_trade(db: AsyncSession, trade_id: UUID, user_id: str) -> bool:
    trade = await get_trade(db, trade_id, user_id)
    if trade is None:
        return False
    await db.delete(trade)
    await db.commit()
    return True
