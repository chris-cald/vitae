from typing import Any
from alembic.autogenerate import renderers
from alembic.operations import ops


def render_create_table(context: Any, op: Any) -> str:
    # Replace op.create_table with helper function in autogenerate output
    table_name: str = op.table_name
    args: list[str] = []
    for col in getattr(op, "columns", []):
        # Only process actual columns, not constraints
        if hasattr(col, "type") and hasattr(col, "name"):
            col_type = f"sa.{type(col.type).__name__}()"
            col_str = f"sa.Column({repr(col.name)}, {col_type}"
            if getattr(col, "primary_key", False):
                col_str += ", primary_key=True"
            if not getattr(col, "nullable", True):
                col_str += ", nullable=False"
            col_str += ")"
            args.append(col_str)
    for constraint in getattr(op, "constraints", []):
        if hasattr(constraint, "columns"):
            col_names = ", ".join(
                [repr(a.name) for a in getattr(constraint, "columns", [])]
            )
            args.append(f"sa.{type(constraint).__name__}({col_names})")
        else:
            args.append(f"sa.{type(constraint).__name__}()")
    kwargs: list[str] = [f"{k}={repr(v)}" for k, v in getattr(op, "kw", {}).items()]
    args_str = ",\n        ".join(args)
    kwargs_str = ", ".join(kwargs)
    import_helpers = "from db.alembic.helpers import create_table_if_not_exists, create_index_if_not_exists\n"
    if kwargs_str:
        return (
            import_helpers
            + f"create_table_if_not_exists('{table_name}',\n        {args_str},\n        {kwargs_str})"
        )
    else:
        return (
            import_helpers
            + f"create_table_if_not_exists('{table_name}',\n        {args_str})"
        )


renderers.dispatch_for(ops.CreateTableOp, replace=True)(render_create_table)
