from typing import Any
from alembic.operations import ops
from alembic.autogenerate import renderers


def render_add_column(context: Any, op: Any) -> str:
    dialect = context.dialect.name
    col = op.column
    table = op.table_name

    # For SQLite, use batch_alter_table
    if dialect == "sqlite":
        return (
            f"with op.batch_alter_table('{table}') as batch_op:\n"
            f"    batch_op.add_column({repr(col)})"
        )
    # For Postgres and others, use regular add_column
    return f"op.add_column('{table}', {repr(col)})"


# Register the custom renderer for AddColumnOp
renderers.dispatch_for(ops.AddColumnOp, replace=True)(render_add_column)
