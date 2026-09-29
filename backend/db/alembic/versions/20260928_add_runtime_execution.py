"""Add runtime execution ledger table."""

from alembic import op
import sqlalchemy as sa

revision = "20260928_runtime_execution"
down_revision = "05f39f4ee301"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "runtimeexecution",
        sa.Column("execution_id", sa.String(), primary_key=True),
        sa.Column("tenant_key", sa.String(), nullable=False),
        sa.Column("workflow_definition_id", sa.String(), nullable=False),
        sa.Column("workflow_version", sa.String(), nullable=False),
        sa.Column("workflow_run_id", sa.String(), nullable=True),
        sa.Column("correlation_id", sa.String(), nullable=False),
        sa.Column("idempotency_key", sa.String(), nullable=False, unique=True),
        sa.Column("workflow_type", sa.String(), nullable=False),
        sa.Column("status_code", sa.String(), nullable=False),
        sa.Column("diagnostic_code", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_runtimeexecution_tenant_key", "runtimeexecution", ["tenant_key"])
    op.create_index("ix_runtimeexecution_workflow_definition_id", "runtimeexecution", ["workflow_definition_id"])
    op.create_index("ix_runtimeexecution_correlation_id", "runtimeexecution", ["correlation_id"])
    op.create_index("ix_runtimeexecution_idempotency_key", "runtimeexecution", ["idempotency_key"])
    op.create_index("ix_runtimeexecution_workflow_type", "runtimeexecution", ["workflow_type"])
    op.create_index("ix_runtimeexecution_status_code", "runtimeexecution", ["status_code"])


def downgrade():
    op.drop_index("ix_runtimeexecution_status_code", table_name="runtimeexecution")
    op.drop_index("ix_runtimeexecution_workflow_type", table_name="runtimeexecution")
    op.drop_index("ix_runtimeexecution_idempotency_key", table_name="runtimeexecution")
    op.drop_index("ix_runtimeexecution_correlation_id", table_name="runtimeexecution")
    op.drop_index("ix_runtimeexecution_workflow_definition_id", table_name="runtimeexecution")
    op.drop_index("ix_runtimeexecution_tenant_key", table_name="runtimeexecution")
    op.drop_table("runtimeexecution")
