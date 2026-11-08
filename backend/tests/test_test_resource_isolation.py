"""Run the real upload regression behind pre-import synthetic connection traps."""
import os
from pathlib import Path
import subprocess
import sys


GUARD = '''
import os
from pathlib import Path
import sqlite3
import socket
import dotenv
import pytest
import sqlalchemy.ext.asyncio as sa

root = Path(os.environ["TMPDIR"]).resolve()
original_engine = sa.create_async_engine
original_connect = sqlite3.connect
resources = []

def forbidden(*args, **kwargs):
    raise AssertionError("network or dotenv discovery blocked")

socket.socket.connect = forbidden
dotenv.main.find_dotenv = forbidden

def pytest_generate_tests(metafunc):
    metafunc.parametrize("isolated_test_resources", [0, 1], indirect=True)

def allowed(path):
    path = Path(path).resolve()
    assert path.is_relative_to(root), "unsafe database initialization/connection blocked"
    return path

def engine(url, *args, **kwargs):
    from sqlalchemy.engine import make_url
    parsed = make_url(url)
    assert parsed.drivername == "sqlite+aiosqlite", "non-test database blocked"
    allowed(parsed.database)
    return original_engine(url, *args, **kwargs)

def connect(database, *args, **kwargs):
    allowed(database)
    return original_connect(database, *args, **kwargs)

sa.create_async_engine = engine
sqlite3.connect = connect

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_call(item):
    from db import db
    database = allowed(db.engine.url.database)
    upload = Path(os.environ["UPLOAD_DIR"])
    assert upload.is_relative_to(root)
    assert not database.exists(), "database leaked between tests"
    assert not list(upload.iterdir()), "uploads leaked between tests"
    resources.append((database, upload))
    yield
    assert database.is_file(), "real database writes were not exercised"
    assert list(upload.iterdir()), "real upload was not exercised"

@pytest.hookimpl(hookwrapper=True, tryfirst=True)
def pytest_runtest_teardown(item):
    yield
    database, upload = resources[-1]
    assert not database.exists(), "database survived test teardown"
    assert not upload.exists(), "uploads survived test teardown"

def pytest_sessionfinish(session, exitstatus):
    if exitstatus == 0:
        assert len(resources) == 2
        assert resources[0] != resources[1], "test resources were reused"
'''


def test_upload_regression_rejects_hostile_database_and_cleans_each_test(tmp_path):
    backend = Path(__file__).resolve().parents[1]
    sentinel = tmp_path / "hostile.db"
    sentinel.write_bytes(b"synthetic sentinel: never a database")
    scratch = tmp_path / "scratch"
    scratch.mkdir()
    (tmp_path / "resource_guard.py").write_text(GUARD)
    # Deliberately do not copy or inspect the caller's environment/credentials.
    env = {
        "PATH": str(Path(sys.executable).parent) + os.pathsep + "/usr/bin:/bin",
        "PYTHONPATH": os.pathsep.join((str(tmp_path), str(backend))),
        "PYTEST_DISABLE_PLUGIN_AUTOLOAD": "1",
        "DATABASE_URL": f"sqlite+aiosqlite:///{sentinel}",
        "TMPDIR": str(scratch),
        "HOME": str(scratch),
        "LITELLM_LOCAL_MODEL_COST_MAP": "True",
    }
    target = "tests/test_integration_full.py::test_resume_upload_and_list"
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-p", "resource_guard",
         "scripts/test_embeddings.py", target],
        cwd=backend, env=env, capture_output=True, text=True,
    )
    assert sentinel.read_bytes() == b"synthetic sentinel: never a database"
    assert result.returncode == 0, result.stdout + result.stderr
    assert "2 passed" in result.stdout
    assert not list(scratch.glob("vitae-tests-*")), "session resources survived"
