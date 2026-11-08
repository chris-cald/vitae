# WI-071 implementation evidence

## Scope and provenance

- Worktree: `wi-071`, branch `worktree/wi-071-test-safety`, base `551714e`.
- Parent run: `01M6YA7Q5YRGZ4RJPRKRNKTJQH`; implementation effect: `01M6YA7YXTE8AZ8RJG1KE1ERZH`.
- Original independent source review: session `09745b5c-0fe1-4729-8f06-6e62a7ef9e8c` found that the always-run upload regression initialized/wrote the configured database despite temporary uploads. PR20 provider comment `4507514682` independently reports the same issue. These findings are retained, not replaced by a claim that the original test was safe.
- No production runtime changes, WI-058 repairs, UI repairs, provider calls, publication, approval, merge, claim or closure changes. The WI-071 ready-to-running metadata change was supplied by the parent and included as authorized. Existing prerequisite/WI-058 ancestry is inherited from the base, not delivered as new repairs by this diff.

## Red → green

1. Added `backend/tests/test_test_resource_isolation.py` before the fixture fix. The original upload test was loaded only in a sanitized subprocess with a synthetic hostile database sentinel and engine/SQLite connection traps installed before app import. No real database setting was copied or inspected. Dotenv was disabled for this initial red probe.
2. Red command: `cd backend && PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python -m pytest -q tests/test_test_resource_isolation.py`. Result: **1 failed**, expected. The synthetic engine was rejected at `db/db.py:13` with `unsafe database initialization/connection blocked`, before connection/startup; sentinel bytes were unchanged. Full receipt: `red.log`.
3. Added pre-collection environment isolation and per-test temporary SQLite/upload resources. The fixture replaces `db.engine` for startup and rebinds the existing shared `AsyncSessionLocal` factory for directly imported service references. Engines are disposed before directory cleanup; NullPool avoids cross-event-loop pooled connections. App/runtime code is unchanged.
4. First focused run: **1 failed, 4 passed, 2 skipped**. The upload passed, but pytest deduplicated repeated node IDs; the harness saw one cycle rather than two. Preserved in `focused.log`. Replaced duplicate CLI arguments with indirect fixture parametrization.
5. Corrected focused run: **5 passed, 2 skipped** (`focused-green.log`). The child now checks two unique resource sets, initially absent DB/empty uploads, actual DB/upload writes, and removal after each teardown plus session cleanup. Its hostile sentinel remains unchanged. Network and dotenv-discovery traps are installed; the fixture itself must disable dotenv before import.
6. Broader source inspection identified `backend/scripts/test_embeddings.py` outside `tests/`, which can import services during collection. The first broad check was stopped as a precaution; its result is not used as final validation. Moved the fixture to `backend/conftest.py` and extended the guarded child to collect that script before the upload test. No real databases or connection values were inspected to investigate this collection-order risk.

## Historical evidence corrections

- WI061: validates the existing fallback from `bb73c89`, not a new runtime repair. The prior checked extraction/schema-error criterion is explicitly withdrawn with its original assertion preserved in the addendum. Verified source returns parser exceptions as text and persists extracted content before provider fallback, so a 200 upload response does not prove error rejection. Runtime repair remains outside this scope (PR20 comment `4507514686`).
- WI065: corrected title/summary and `wi:065` subject; addendum preserves the original WI064 wording and explains why earlier passing gates did not prove database isolation.
- WI067: work-item and all three linked validation/review records now explicitly describe earlier snapshots superseded by `341af6c408e86bfc7b7245332efa88b9419d0ce2`. No restoration or governance reopening is attempted by this worker.

## Validation and delivery boundary

Pinned Node `22.17.0` / npm `10.9.2`; locked backend dependencies installed with `npm run setup` (exit 0). Explicit draft gate: `npm --prefix frontend-draft ci && npm --prefix frontend-draft run check` passed: **8 tests**, TypeScript, production build (`draft.log`).

Final backend/root and clean-checkout rehearsal results will be appended after completion. Independent reapproval of the exact revised PR20 source, provider/CI review resolution, publication and closure remain parent-owned. Earlier review approval or a green status check is not approval of this revision. Live integration/provider/browser/UAT gates are not claimed by this test-only lane.
