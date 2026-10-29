import importlib.util
from pathlib import Path
from types import SimpleNamespace


MIGRATION_PATH = (
    Path(__file__).parents[1]
    / "db/alembic/versions/20261030_add_runtime_execution_dispatch_attempt.py"
)


def load_migration():
    spec = importlib.util.spec_from_file_location("runtime_execution_dispatch_attempt", MIGRATION_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_dispatch_attempt_migration_is_short_and_safe_after_create_all(monkeypatch):
    migration = load_migration()
    added = []
    dropped = []
    columns = [{"name": "dispatch_attempt"}]
    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            get_bind=lambda: object(),
            add_column=lambda table, column: added.append((table, column.name)),
            drop_column=lambda table, column: dropped.append((table, column)),
        ),
    )
    monkeypatch.setattr(
        migration.sa,
        "inspect",
        lambda _bind: SimpleNamespace(get_columns=lambda _table: columns),
    )

    migration.upgrade()
    migration.downgrade()

    assert len(migration.revision) <= 32
    assert added == []
    assert dropped == [("runtimeexecution", "dispatch_attempt")]
