"""Add career inventory tables.

Revision ID: 20261027_career_inventory
Revises: 20260928_runtime_execution
"""

from alembic import op
import sqlalchemy as sa

revision = "20261027_career_inventory"
down_revision = "20260928_runtime_execution"
branch_labels = None
depends_on = None


def upgrade():
    tables = sa.inspect(op.get_bind()).get_table_names()
    if "careerinventoryseed" not in tables:
        op.create_table(
            "careerinventoryseed",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("source_id", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("source_ref", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_careerinventoryseed_source_id", "careerinventoryseed", ["source_id"], unique=True)
        op.create_index("ix_careerinventoryseed_status", "careerinventoryseed", ["status"])
    if "careerinventoryaction" not in tables:
        op.create_table(
            "careerinventoryaction",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("action", sa.String(), nullable=False),
            sa.Column("seed_id", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("provenance_ref", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_careerinventoryaction_action", "careerinventoryaction", ["action"])
        op.create_index("ix_careerinventoryaction_seed_id", "careerinventoryaction", ["seed_id"])
        op.create_index("ix_careerinventoryaction_status", "careerinventoryaction", ["status"])


def downgrade():
    tables = sa.inspect(op.get_bind()).get_table_names()
    if "careerinventoryaction" in tables:
        op.drop_index("ix_careerinventoryaction_status", table_name="careerinventoryaction")
        op.drop_index("ix_careerinventoryaction_seed_id", table_name="careerinventoryaction")
        op.drop_index("ix_careerinventoryaction_action", table_name="careerinventoryaction")
        op.drop_table("careerinventoryaction")
    if "careerinventoryseed" in tables:
        op.drop_index("ix_careerinventoryseed_status", table_name="careerinventoryseed")
        op.drop_index("ix_careerinventoryseed_source_id", table_name="careerinventoryseed")
        op.drop_table("careerinventoryseed")
