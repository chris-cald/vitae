from logging.config import fileConfig


import os
import sys
from sqlalchemy import pool
from alembic import context
from typing import Optional
from models import job, resume, job_fit  # pyright: ignore[reportUnusedImport] # noqa: F401 # Import all SQLModels here
from sqlmodel import SQLModel

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Import all models to ensure they are registered with SQLModel

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def make_sync_url(url: Optional[str]) -> Optional[str]:
    if url is None:
        return url
    # SQLite async to sync
    if url.startswith("sqlite+aiosqlite"):
        return url.replace("sqlite+aiosqlite", "sqlite", 1)
    # PostgreSQL async to sync
    if url.startswith("postgresql+asyncpg"):
        return url.replace("postgresql+asyncpg", "postgresql", 1)
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    url = make_sync_url(url)
    if url is None:
        raise ValueError(
            "Database URL must be provided via the DATABASE_URL environment variable or sqlalchemy.url in alembic.ini."
        )
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    url = make_sync_url(url)
    if url is None:
        raise ValueError(
            "Database URL must be provided via the DATABASE_URL environment variable or sqlalchemy.url in alembic.ini."
        )
    from sqlalchemy import create_engine

    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
