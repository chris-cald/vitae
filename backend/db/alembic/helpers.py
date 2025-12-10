from typing import Any


def create_table_if_not_exists(table_name: str, *columns: Any, **kwargs: Any) -> None:
    """
    Create a table only if it does not already exist (SQLite only).
    Usage: create_table_if_not_exists('jobfit', sa.Column(...), ..., sa.PrimaryKeyConstraint(...))
    """
    from alembic import op
    import sqlalchemy as sa

    bind = op.get_bind()
    exists = False
    if bind.dialect.name == "sqlite":
        result = bind.execute(
            sa.text(
                f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"
            )
        )
        exists = result.fetchone() is not None
    else:
        insp = sa.inspect(bind)
        exists = table_name in insp.get_table_names()
    if not exists:
        op.create_table(table_name, *columns, **kwargs)


from alembic import op
from sqlalchemy.engine import Connection


def create_index_if_not_exists(
    index_name: str, table_name: str, columns: list[str], unique: bool = False
):
    """
    Create an index only if it does not already exist. Works for SQLite and other dialects.
    Usage: create_index_if_not_exists('ix_table_col', 'table', ['col'], unique=True)
    """
    import sqlalchemy as sa

    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        result = bind.execute(
            sa.text(
                f"SELECT name FROM sqlite_master WHERE type='index' AND name='{index_name}'"
            )
        )
        if not result.fetchone():
            unique_sql = "UNIQUE" if unique else ""
            cols_sql = ", ".join(columns)
            bind.execute(
                sa.text(
                    f"CREATE {unique_sql} INDEX {index_name} ON {table_name} ({cols_sql})"
                )
            )
    else:
        op.create_index(index_name, table_name, columns, unique=unique)
