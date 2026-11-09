"""Own database/upload resources before collection imports the application.

A request dependency override alone cannot protect lifespan initialization or
services that import AsyncSessionLocal directly. Rebind that shared factory for
each test, and dispose engines before removing their temporary directories.
"""
import asyncio
import os
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool


# Never read the caller's database setting or .env. Collection itself imports db.
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"
_collection_resources = TemporaryDirectory(prefix="vitae-tests-collection-")
os.environ["DATABASE_URL"] = (
    f"sqlite+aiosqlite:///{_collection_resources.name}/collection.db"
)
os.environ["UPLOAD_DIR"] = _collection_resources.name

from db import db  # noqa: E402 -- environment isolation MUST precede this import

_collection_engine = db.engine


@pytest.fixture(autouse=True)
def isolated_test_resources(monkeypatch):
    with TemporaryDirectory(prefix="vitae-tests-") as directory:
        root = Path(directory)
        uploads = root / "uploads"
        uploads.mkdir()
        url = f"sqlite+aiosqlite:///{root / 'test.db'}"
        engine = create_async_engine(url, echo=False, poolclass=NullPool)
        monkeypatch.setenv("DATABASE_URL", url)
        monkeypatch.setenv("UPLOAD_DIR", str(uploads))
        monkeypatch.setattr(db, "engine", engine)
        # Imported references in services retain this same session factory.
        db.AsyncSessionLocal.configure(bind=engine)
        try:
            yield uploads
        finally:
            asyncio.run(engine.dispose())
            db.AsyncSessionLocal.configure(bind=_collection_engine)


def pytest_sessionfinish(session, exitstatus):
    asyncio.run(_collection_engine.dispose())
    _collection_resources.cleanup()
