from typing import Any
from alembic.autogenerate import renderers
from alembic.operations import ops


def render_create_index(context: Any, op: Any) -> str:
    # Replace op.create_index with helper function in autogenerate output
    index_name: str = op.index_name
    table_name: str = op.table_name
    columns: Any = op.columns
    unique: Any = op.unique
    # Emit column names as strings
    col_names = [
        repr(col.name) if hasattr(col, "name") else repr(col) for col in columns
    ]
    return f"create_index_if_not_exists('{index_name}', '{table_name}', [{', '.join(col_names)}], unique={unique})"


renderers.dispatch_for(ops.CreateIndexOp, replace=True)(render_create_index)
