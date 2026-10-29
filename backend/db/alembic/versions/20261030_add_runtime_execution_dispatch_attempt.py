"""Add dispatch attempt fencing to runtime executions."""

from alembic import op
import sqlalchemy as sa

revision = "20261030_runtime_execution_dispatch_attempt"
down_revision = "20261029_book_of_work_refresh"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "runtimeexecution",
        sa.Column("dispatch_attempt", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade():
    op.drop_column("runtimeexecution", "dispatch_attempt")
