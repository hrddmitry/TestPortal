"""add users password hash

Revision ID: cefd3b072674
Revises: ceefb983f82b
Create Date: 2026-11-27 12:36:49.318678

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "cefd3b072674"
down_revision: Union[str, Sequence[str], None] = "ceefb983f82b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(), nullable=True),
    )
    op.execute(
        "UPDATE users SET password_hash = '!' WHERE password_hash IS NULL"
    )
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column("users", "password_hash")
