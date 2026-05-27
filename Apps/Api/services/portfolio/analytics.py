from __future__ import annotations
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.logging import get_logger
from models.portfolio import Portfolio, PortfolioHolding
from schemas.portfolio import HoldingWithPnL, PortfolioSummary
from services.cache.market_cache import get_cached_price
from services.market.binance_rest import get_binance_rest
from services.market.normalizer import normalize_binance_24hr

logger = get_logger(__name__)

_ZERO = Decimal("0")


def _normalise_symbol(symbol: str) -> str:
    s = symbol.upper()
    if not s.endswith("USDT") and not s.endswith("BTC") and not s.endswith("ETH"):
        return s + "USDT"
    return s


async def _get_price(symbol: str) -> Decimal | None:
    normalised = _normalise_symbol(symbol)
    cached = await get_cached_price(normalised)
    if cached:
        return cached.price
    try:
        client = await get_binance_rest()
        raw = await client.get_ticker(normalised)
        tick = normalize_binance_24hr(raw)
        return tick.price
    except Exception:
        return None


def _compute_holding(holding: PortfolioHolding, current_price: Decimal | None, total_value: Decimal) -> HoldingWithPnL:
    cost_basis = holding.quantity * holding.avg_buy_price
    current_value = holding.quantity * current_price if current_price else None
    unrealised_pnl: Decimal | None = None
    unrealised_pnl_pct: float | None = None
    allocation_pct: float | None = None

    if current_value is not None:
        unrealised_pnl = current_value - cost_basis
        if cost_basis > _ZERO:
            unrealised_pnl_pct = float((unrealised_pnl / cost_basis) * 100)
        if total_value > _ZERO:
            allocation_pct = float((current_value / total_value) * 100)

    return HoldingWithPnL(
        id=holding.id,
        asset_symbol=holding.asset_symbol,
        asset_name=holding.asset_name,
        market_type=holding.market_type,
        exchange=holding.exchange,
        quantity=holding.quantity,
        avg_buy_price=holding.avg_buy_price,
        current_price=current_price,
        current_value=current_value,
        cost_basis=cost_basis,
        unrealised_pnl=unrealised_pnl,
        unrealised_pnl_pct=unrealised_pnl_pct,
        allocation_pct=allocation_pct,
    )


async def compute_portfolio_summary(db: AsyncSession, user_id: str) -> PortfolioSummary | None:
    stmt = select(Portfolio).where(Portfolio.user_id == user_id).limit(1)
    result = await db.execute(stmt)
    portfolio = result.scalars().first()
    if portfolio is None:
        return None

    stmt2 = select(PortfolioHolding).where(PortfolioHolding.portfolio_id == portfolio.id)
    result2 = await db.execute(stmt2)
    holdings: list[PortfolioHolding] = list(result2.scalars().all())

    prices: dict[str, Decimal | None] = {}
    for h in holdings:
        prices[h.asset_symbol] = await _get_price(h.asset_symbol)

    # First pass: total current value
    total_current_value = _ZERO
    for h in holdings:
        price = prices.get(h.asset_symbol)
        if price:
            total_current_value += h.quantity * price

    total_cost_basis = sum((h.quantity * h.avg_buy_price for h in holdings), _ZERO)
    total_unrealised_pnl: Decimal | None = None
    total_unrealised_pnl_pct: float | None = None

    if total_current_value > _ZERO:
        total_unrealised_pnl = total_current_value - total_cost_basis
        if total_cost_basis > _ZERO:
            total_unrealised_pnl_pct = float((total_unrealised_pnl / total_cost_basis) * 100)

    holdings_with_pnl = [
        _compute_holding(h, prices.get(h.asset_symbol), total_current_value)
        for h in holdings
    ]

    return PortfolioSummary(
        portfolio_id=portfolio.id,
        portfolio_name=portfolio.name,
        currency=portfolio.currency,
        total_cost_basis=total_cost_basis,
        total_current_value=total_current_value if total_current_value > _ZERO else None,
        total_unrealised_pnl=total_unrealised_pnl,
        total_unrealised_pnl_pct=total_unrealised_pnl_pct,
        holdings=holdings_with_pnl,
        holdings_count=len(holdings_with_pnl),
    )
