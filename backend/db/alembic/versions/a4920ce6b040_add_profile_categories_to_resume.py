"""Add profile_categories to resume

Revision ID: a4920ce6b040
Revises: 52525b5be28e
Create Date: 2025-12-14 01:26:43.050506

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a4920ce6b040"
down_revision: Union[str, Sequence[str], None] = "52525b5be28e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect != "sqlite":
        with op.batch_alter_table("job", schema=None) as batch_op:
            batch_op.alter_column(
                "profile_categories",
                existing_type=sa.TEXT(),
                type_=sa.JSON(),
                existing_nullable=True,
            )

    with op.batch_alter_table("resume", schema=None) as batch_op:
        batch_op.add_column(sa.Column("profile_categories", sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    dialect = bind.dialect.name

    with op.batch_alter_table("resume", schema=None) as batch_op:
        batch_op.drop_column("profile_categories")

    if dialect != "sqlite":
        with op.batch_alter_table("job", schema=None) as batch_op:
            batch_op.alter_column(
                "profile_categories",
                existing_type=sa.JSON(),
                type_=sa.TEXT(),
                existing_nullable=True,
            )
