"""add file_path to rawjob

Revision ID: f9e80f04414c
Revises: add_name_columns_20251210
Create Date: 2025-12-11 00:57:04.349575

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f9e80f04414c"
down_revision: Union[str, Sequence[str], None] = "add_name_columns_20251210"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch_alter_table for SQLite compatibility, only add file_path column
    with op.batch_alter_table("rawjob") as batch_op:
        batch_op.add_column(sa.Column("file_path", sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("rawjob") as batch_op:
        batch_op.drop_column("file_path")
