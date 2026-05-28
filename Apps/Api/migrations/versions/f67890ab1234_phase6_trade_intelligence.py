"""phase6_trade_intelligence

Revision ID: f67890ab1234
Revises: e56f78a9b012
Create Date: 2026-05-28 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'f67890ab1234'
down_revision: Union[str, None] = 'e56f78a9b012'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('trades', sa.Column(
        'investment_amount',
        sa.Numeric(precision=28, scale=10),
        nullable=True,
    ))
    op.add_column('trades', sa.Column(
        'category',
        sa.String(length=50),
        nullable=True,
    ))


def downgrade() -> None:
    op.drop_column('trades', 'category')
    op.drop_column('trades', 'investment_amount')
