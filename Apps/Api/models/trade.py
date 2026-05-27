from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from core.database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_symbol = Column(String(30), nullable=False, index=True)
    asset_name = Column(String(255), nullable=True)
    market_type = Column(String(20), nullable=False)  # crypto | stock
    exchange = Column(String(50), nullable=False)
    trade_type = Column(String(10), nullable=False)  # buy | sell

    buy_price = Column(Numeric(precision=28, scale=10), nullable=True)
    sell_price = Column(Numeric(precision=28, scale=10), nullable=True)
    quantity = Column(Numeric(precision=28, scale=10), nullable=False)
    position_size = Column(Numeric(precision=28, scale=10), nullable=True)
    fees_paid = Column(Numeric(precision=28, scale=10), default=0)
    currency = Column(String(10), default="USDT", nullable=False)

    entry_at = Column(DateTime(timezone=True), nullable=True)
    exit_at = Column(DateTime(timezone=True), nullable=True)

    pnl_amount = Column(Numeric(precision=28, scale=10), nullable=True)
    pnl_percentage = Column(Numeric(precision=10, scale=4), nullable=True)
    break_even_price = Column(Numeric(precision=28, scale=10), nullable=True)

    notes = Column(Text, nullable=True)
    strategy_tags = Column(ARRAY(String), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    portfolio = relationship("Portfolio", back_populates="trades")
