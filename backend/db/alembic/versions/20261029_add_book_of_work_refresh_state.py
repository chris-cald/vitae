"""Add privacy-safe Book of Work refresh state.

Revision ID: 20261029_book_of_work_refresh
Revises: 20261027_career_inventory
"""

from alembic import op
import sqlalchemy as sa

revision = "20261029_book_of_work_refresh"
down_revision = "20261027_career_inventory"
branch_labels = None
depends_on = None


def upgrade():
    if "bookofworkrefreshstate" not in sa.inspect(op.get_bind()).get_table_names():
        op.create_table(
            "bookofworkrefreshstate",
            sa.Column("source_key", sa.String(), nullable=False),
            sa.Column("snapshot", sa.JSON(), nullable=False),
            sa.PrimaryKeyConstraint("source_key"),
        )


def downgrade():
    if "bookofworkrefreshstate" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("bookofworkrefreshstate")
