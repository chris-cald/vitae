"""Add profile_categories column to job

Revision ID: 52525b5be28e
Revises: f9e80f04414c
Create Date: 2025-12-11 22:13:05.778839

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "52525b5be28e"
down_revision: Union[str, Sequence[str], None] = "f9e80f04414c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    dialect = bind.dialect.name
    # Use batch_alter_table for SQLite compatibility
    with op.batch_alter_table("job") as batch_op:
        if dialect == "sqlite":
            batch_op.add_column(
                sa.Column("profile_categories", sa.Text(), nullable=True)
            )
        else:
            batch_op.add_column(
                sa.Column("profile_categories", sa.JSON(), nullable=True)
            )
    # Foreign keys: only add if not sqlite (SQLite doesn't support ALTER for FKs)
    if dialect != "sqlite":
        op.create_foreign_key(None, "job", "resume", ["resume_id"], ["resume_id"])
        op.create_foreign_key(None, "job", "job", ["job_id"], ["job_id"])
        op.create_foreign_key(None, "rawjob", "job", ["job_id"], ["job_id"])
        op.create_foreign_key(None, "rawjob", "resume", ["resume_id"], ["resume_id"])
        op.create_foreign_key(None, "resume", "rawresume", ["resume_id"], ["resume_id"])


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    dialect = bind.dialect.name
    with op.batch_alter_table("job") as batch_op:
        batch_op.drop_column("profile_categories")
    if dialect != "sqlite":
        op.drop_constraint(None, "resume", type_="foreignkey")
        op.drop_constraint(None, "rawjob", type_="foreignkey")
        op.drop_constraint(None, "rawjob", type_="foreignkey")
        op.drop_constraint(None, "job", type_="foreignkey")
        op.drop_constraint(None, "job", type_="foreignkey")
