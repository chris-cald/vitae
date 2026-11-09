# Backend isolation exposed a test-order dependency

Command: `VITAE_LIVE_INTEGRATION=0 npm run check` (pinned Node/npm).

Before correction: **1 failed, 125 passed, 5 skipped**, 19.41 seconds. The gate stopped before frontend stages.

Failing test: `tests/test_job_service_local_fallback.py::test_job_upload_uses_local_parse_fallback_when_model_unavailable`.

Failure: SQLite `OperationalError` inserting into a table absent from the new per-test database. This service-level test used real persistence without calling `init_db`, relying on a prior test's app startup. The original complete local output is retained in ignored `check-final.log`; this concise receipt omits SQL parameters and synthetic document content.

Correction is test-only: call `await init_db()` before exercising the service and use the fixture-owned temporary upload directory rather than pytest-retained `tmp_path`. The production service and database initialization behavior are unchanged.
