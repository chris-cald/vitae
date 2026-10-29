# Placeholder for database connection and Alembic config

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator, TYPE_CHECKING, reveal_type
from sqlmodel import SQLModel
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")


engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


if TYPE_CHECKING:
    reveal_type(AsyncSessionLocal)


# Create tables using SQLModel metadata
async def init_db():
    from src.models import application_bundle, book_of_work_refresh, career_inventory, runtime_execution  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
