"""phase45_auth_hardening

Revision ID: e56f78a9b012
Revises: a32d78ce184b
Create Date: 2026-05-28 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e56f78a9b012'
down_revision: Union[str, None] = 'a32d78ce184b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('email_verification_token_hash', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('email_verification_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('password_reset_token_hash', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('password_reset_expires_at', sa.DateTime(timezone=True), nullable=True))

    op.create_index(
        op.f('ix_users_email_verification_token_hash'),
        'users', ['email_verification_token_hash'], unique=False
    )
    op.create_index(
        op.f('ix_users_password_reset_token_hash'),
        'users', ['password_reset_token_hash'], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_users_password_reset_token_hash'), table_name='users')
    op.drop_index(op.f('ix_users_email_verification_token_hash'), table_name='users')
    op.drop_column('users', 'password_reset_expires_at')
    op.drop_column('users', 'password_reset_token_hash')
    op.drop_column('users', 'email_verification_expires_at')
    op.drop_column('users', 'email_verification_token_hash')
