from typing import Any
from alembic.autogenerate import renderers
from alembic.operations import ops


def render_create_table(context: Any, op: Any) -> str:
    # Replace op.create_table with helper function in autogenerate output
    table_name: str = op.name
    args: list[str] = [repr(col) for col in getattr(op, "columns", [])]
    args += [repr(constraint) for constraint in getattr(op, "constraints", [])]
    kwargs: list[str] = [f"{k}={repr(v)}" for k, v in getattr(op, "kw", {}).items()]
    args_str = ",\n        ".join(args)
    kwargs_str = ", ".join(kwargs)
    if kwargs_str:
        return f"create_table_if_not_exists('{table_name}',\n        {args_str},\n        {kwargs_str})"
    else:
        return f"create_table_if_not_exists('{table_name}',\n        {args_str})"


renderers.dispatch_for(ops.CreateTableOp, replace=True)(render_create_table)


def render_create_index(context: Any, op: Any) -> str:
    # Replace op.create_index with helper function in autogenerate output
    index_name: str = op.name
    table_name: str = op.table_name
    columns: Any = op.columns
    unique: Any = op.unique
    return f"create_index_if_not_exists('{index_name}', '{table_name}', {columns}, unique={unique})"


renderers.dispatch_for(ops.CreateIndexOp, replace=True)(render_create_index)
