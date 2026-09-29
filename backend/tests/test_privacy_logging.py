import ast
from pathlib import Path

FORBIDDEN_LOG_TOKENS = {
    "traceback.format_exc",
    "file_path",
    "abs_path",
    "job_url",
    "filename",
    "name=",
    "prompt=",
    "content=",
    ": {exc}",
    ": {e}",
    "response['error']",
    "Fragment:",
    "Value:",
    "unavailable: %s",
}

LOG_FILES = [
    Path("src/api/router/v1/resume.py"),
    Path("src/services/job_service.py"),
    Path("src/services/resume_service.py"),
    Path("src/services/utils.py"),
    Path("src/services/profile_category_detection.py"),
]

ROUTER_FILES = list(Path("src/api/router/v1").glob("*.py"))


def _logger_calls(path: Path):
    source = path.read_text()
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        if node.func.attr not in {"debug", "info", "warning", "error", "exception"}:
            continue
        if ast.get_source_segment(source, node):
            yield ast.get_source_segment(source, node)


def test_backend_logs_do_not_emit_pii_bearing_values():
    offenders = []
    for path in LOG_FILES:
        for call in _logger_calls(path):
            for token in FORBIDDEN_LOG_TOKENS:
                if token in call:
                    offenders.append(f"{path}: {token}: {call}")

    assert offenders == []


def test_database_engine_does_not_echo_sql_parameters():
    from db.db import engine

    assert engine.echo is False


def test_api_errors_do_not_echo_raw_exception_messages():
    offenders = [path for path in ROUTER_FILES if "detail=str(e)" in path.read_text()]

    assert offenders == []
