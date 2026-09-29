#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UAT_ARTIFACT_DIR="${UAT_ARTIFACT_DIR:-$ROOT_DIR/artifacts/uat/$(date -u +%Y%m%dT%H%M%SZ)}"
UAT_PROJECT="${UAT_PROJECT:-vitae-uat}"
UAT_START_STACK="${UAT_START_STACK:-0}"
UAT_STATIC_ONLY="${UAT_STATIC_ONLY:-1}"
UAT_RUN_CUCUMBER="${UAT_RUN_CUCUMBER:-0}"
UAT_INSTALL_PLAYWRIGHT_BROWSERS="${UAT_INSTALL_PLAYWRIGHT_BROWSERS:-1}"
UAT_USE_PI_BRIDGE="${UAT_USE_PI_BRIDGE:-0}"
UAT_TEARDOWN="${UAT_TEARDOWN:-1}"
UAT_COMPOSE_FILE="${UAT_COMPOSE_FILE:-$ROOT_DIR/uat/podman-compose.yml}"
BACKEND_PYTHON="${BACKEND_PYTHON:-$ROOT_DIR/backend/.venv/bin/python}"
[[ -x "$BACKEND_PYTHON" ]] || BACKEND_PYTHON=python3
UAT_API_URL="${UAT_API_URL:-http://localhost:8000}"
UAT_FRONTEND_URL="${UAT_FRONTEND_URL:-http://localhost:5173}"
UAT_TEMPORAL_HISTORY_PATH="${UAT_TEMPORAL_HISTORY_PATH:-}"
CANONICAL_VAULT_PATH="${CANONICAL_VAULT_PATH:-}"
PI_BRIDGE_PID=""

mkdir -p "$UAT_ARTIFACT_DIR"
LOG_FILE="$UAT_ARTIFACT_DIR/uat.log"
SUMMARY_FILE="$UAT_ARTIFACT_DIR/summary.json"
export ROOT_DIR UAT_ARTIFACT_DIR UAT_PROJECT UAT_START_STACK UAT_STATIC_ONLY UAT_RUN_CUCUMBER UAT_INSTALL_PLAYWRIGHT_BROWSERS UAT_USE_PI_BRIDGE UAT_TEARDOWN UAT_COMPOSE_FILE BACKEND_PYTHON UAT_API_URL UAT_FRONTEND_URL UAT_TEMPORAL_HISTORY_PATH CANONICAL_VAULT_PATH LOG_FILE SUMMARY_FILE

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*" | tee -a "$LOG_FILE"; }
compose() { ${UAT_COMPOSE_BIN:-podman-compose} --parallel "${UAT_COMPOSE_PARALLEL:-1}" -f "$UAT_COMPOSE_FILE" -p "$UAT_PROJECT" "$@"; }

write_summary() {
  python3 - <<'PY'
import json, os, pathlib
path = pathlib.Path(os.environ["SUMMARY_FILE"])
path.write_text(json.dumps({
    "artifactDir": str(path.parent),
    "staticOnly": os.environ.get("UAT_STATIC_ONLY"),
    "startedStack": os.environ.get("UAT_START_STACK"),
    "ranCucumber": os.environ.get("UAT_RUN_CUCUMBER"),
    "usedPiBridge": os.environ.get("UAT_USE_PI_BRIDGE"),
    "vaultInventory": bool(os.environ.get("CANONICAL_VAULT_PATH")),
    "temporalHistoryScanned": bool(os.environ.get("UAT_TEMPORAL_HISTORY_PATH")),
}, indent=2) + "\n")
PY
}

snapshot_vault() {
  local label="$1"
  [[ -n "$CANONICAL_VAULT_PATH" ]] || return 0
  PYTHONPATH="$ROOT_DIR/backend" SNAPSHOT_LABEL="$label" "$BACKEND_PYTHON" - <<'PY'
import json, os, pathlib
from src.services.uat_evidence import snapshot_file_inventory
out = pathlib.Path(os.environ["UAT_ARTIFACT_DIR"]) / f"vault-{os.environ['SNAPSHOT_LABEL']}.json"
out.write_text(json.dumps(snapshot_file_inventory(os.environ["CANONICAL_VAULT_PATH"]), indent=2, sort_keys=True) + "\n")
PY
}

assert_vault_unchanged() {
  [[ -n "$CANONICAL_VAULT_PATH" ]] || return 0
  PYTHONPATH="$ROOT_DIR/backend" "$BACKEND_PYTHON" - <<'PY'
import json, os, pathlib
from src.services.uat_evidence import assert_no_vault_inventory_changes
base = pathlib.Path(os.environ["UAT_ARTIFACT_DIR"])
before = json.loads((base / "vault-before.json").read_text())
after = json.loads((base / "vault-after.json").read_text())
assert_no_vault_inventory_changes(before, after)
PY
}

export_temporal_history() {
  [[ "$UAT_START_STACK" == "1" ]] || return 0
  podman container exists "${UAT_PROJECT}_temporal_1" || return 0
  if [[ -z "$UAT_TEMPORAL_HISTORY_PATH" ]]; then
    UAT_TEMPORAL_HISTORY_PATH="$UAT_ARTIFACT_DIR/temporal-history.json"
    export UAT_TEMPORAL_HISTORY_PATH
  fi
  local workflow_id="uat-history-$(date +%s)"
  log "capture: exporting Temporal history $workflow_id"
  podman exec "${UAT_PROJECT}_temporal_1" temporal workflow start --namespace vitae-dev --workflow-id "$workflow_id" --type vitae_runtime_workflow --task-queue vitae-orchestration --input '{"executionId":"exec_00000000-0000-4000-8000-000000000999","workflowType":"curation"}' >/dev/null
  sleep 1
  podman exec "${UAT_PROJECT}_temporal_1" temporal workflow signal --namespace vitae-dev --workflow-id "$workflow_id" --name runtime_decision --input '{"decisionCode":"approve"}' >/dev/null
  podman exec "${UAT_PROJECT}_temporal_1" temporal workflow result --namespace vitae-dev --workflow-id "$workflow_id" >/dev/null
  podman exec "${UAT_PROJECT}_temporal_1" temporal workflow show --namespace vitae-dev --workflow-id "$workflow_id" --output json >"$UAT_TEMPORAL_HISTORY_PATH"
}

scan_temporal_history() {
  [[ -n "$UAT_TEMPORAL_HISTORY_PATH" && -f "$UAT_TEMPORAL_HISTORY_PATH" ]] || return 0
  PYTHONPATH="$ROOT_DIR/backend" "$BACKEND_PYTHON" - <<'PY'
import json, os
from src.services.uat_evidence import assert_no_forbidden_temporal_history
with open(os.environ["UAT_TEMPORAL_HISTORY_PATH"], "r", encoding="utf-8") as handle:
    assert_no_forbidden_temporal_history(json.load(handle))
PY
}

wait_for_url() {
  local url="$1"
  for _ in $(seq 1 60); do
    if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  log "timeout waiting for $url"
  return 1
}

setup() {
  log 'setup: begin'
  mkdir -p "$UAT_ARTIFACT_DIR" "$ROOT_DIR/.uat-empty-vault"
  snapshot_vault before
  if [[ "$UAT_USE_PI_BRIDGE" == "1" ]]; then
    log 'setup: starting local pi OpenAI bridge'
    (cd "$ROOT_DIR" && exec env PI_BRIDGE_API_KEY="${PI_BRIDGE_API_KEY:-local-pi-bridge}" "$BACKEND_PYTHON" -m uvicorn uat.pi_openai_bridge.pi_openai_bridge:app --host 127.0.0.1 --port "${PI_BRIDGE_PORT:-8787}") >>"$LOG_FILE" 2>&1 &
    PI_BRIDGE_PID="$!"
    echo "$PI_BRIDGE_PID" > "$UAT_ARTIFACT_DIR/pi-bridge.pid"
    wait_for_url "http://127.0.0.1:${PI_BRIDGE_PORT:-8787}/health"
  fi
  if [[ "$UAT_START_STACK" == "1" ]]; then
    log 'setup: starting podman compose stack'
    compose up -d --build >>"$LOG_FILE" 2>&1
  fi
  log 'setup: complete'
}

execute_static() {
  log 'execute: static checks'
  (cd "$ROOT_DIR/backend" && "$BACKEND_PYTHON" -m pytest -q tests/test_uat_evidence.py tests/test_runtime_execution_api.py tests/test_pi_openai_bridge.py tests/test_litellm_config.py) | tee -a "$LOG_FILE"
  (cd "$ROOT_DIR/frontend" && node --test test/uat-fixture-smoke.test.mjs test/uat-orchestrator-smoke.test.mjs) | tee -a "$LOG_FILE"
  (cd "$ROOT_DIR" && node --check uat/playwright-cucumber/steps/mvp-expanded-uat.steps.mjs && python3 -m py_compile uat/pi_openai_bridge/pi_openai_bridge.py) | tee -a "$LOG_FILE"
}

seed_uat_browser_data() {
  [[ "$UAT_START_STACK" == "1" ]] || return 0
  log 'execute: seeding synthetic browser UAT data'
  podman exec -i "${UAT_PROJECT}_backend_1" python - <<'PY'
import asyncio
from db.db import init_db, AsyncSessionLocal
from src.models.resume import RawResume, Resume
from src.models.job import RawJob, Job
from src.models.job_fit import JobFit, JobRequirementMapping

async def main():
    await init_db()
    async with AsyncSessionLocal() as session:
        resume_id = 'uat-resume-synthetic'
        job_id = 'uat-job-synthetic'
        mapping_id = 'uat-mapping-synthetic'
        fit_id = 'uat-fit-synthetic'
        await session.merge(RawResume(resume_id=resume_id, file_path='uat://resume', extracted_content='synthetic', content_type='text/markdown'))
        await session.merge(Resume(resume_id=resume_id, name='Synthetic UAT Resume', basics={'name': 'Synthetic UAT'}, work=[], skills=[], profile_categories={}))
        await session.merge(Job(job_id=job_id, resume_id=resume_id, name='Synthetic UAT Role', title='Synthetic UAT Role', company='Vitae UAT', responsibilities=['Build safe UAT'], qualifications=['Testing'], skills=[], profile_categories={}))
        await session.merge(RawJob(job_id=job_id, resume_id=resume_id, content={'title': 'Synthetic UAT Role'}))
        await session.merge(JobRequirementMapping(id=mapping_id, resume_id=resume_id, job_id=job_id, requirements=[{'requirement_id': 'uat-req', 'requirement': 'Testing', 'resume_evidence': 'Synthetic evidence', 'match_level': 'strong', 'notes': 'seeded'}]))
        await session.merge(JobFit(id=fit_id, name='Synthetic UAT Fit', resume_id=resume_id, job_id=job_id, mapping_id=mapping_id, score=0.87, analysis='Synthetic UAT analysis passed.', feedback=[{'job_fit_id': fit_id, 'requirement_id': 'uat-req', 'intent': 'preserve', 'message': 'Keep synthetic evidence.', 'lineNumber': '1', 'weight': 0.9}], keywords=['testing'], skills=[{'name': 'UAT', 'score': 0.87}], created_at='2026-09-29T00:00:00Z'))
        await session.commit()

asyncio.run(main())
PY
}

execute_live_api() {
  log 'execute: live API checks'
  wait_for_url "$UAT_API_URL/api/v1/mvp/application-loop/demo"
  python3 - <<'PY' | tee -a "$LOG_FILE"
import json, os, urllib.request, uuid
api = os.environ["UAT_API_URL"].rstrip("/")
def request(path, data=None):
    body = None if data is None else json.dumps(data).encode()
    req = urllib.request.Request(api + path, data=body, headers={"content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)
expanded = request("/api/v1/mvp/application-loop/expanded-uat")
assert len(expanded["applications"]) >= 2
for workflow_type in ["book-of-work-refresh", "curation", "target-catalog-fit", "deliverable-generation", "application-automation"]:
    started = request("/api/v1/runtime-executions", {"workflow_type": workflow_type, "idempotency_key": f"idem_{uuid.uuid4()}"})
    assert started["execution"]["status_code"] == "accepted"
print(json.dumps({"liveApi": "passed", "workflowTypes": 5}))
PY
}

execute_cucumber() {
  [[ "$UAT_RUN_CUCUMBER" == "1" ]] || return 0
  log 'execute: Playwright/Cucumber UAT'
  (cd "$ROOT_DIR/uat/playwright-cucumber" && npm install && { [[ "$UAT_INSTALL_PLAYWRIGHT_BROWSERS" != "1" ]] || npx playwright install chromium; } && PLAYWRIGHT_BASE_URL="$UAT_FRONTEND_URL" VITAE_API_URL="$UAT_API_URL" TEMPORAL_HISTORY_PATH="$UAT_TEMPORAL_HISTORY_PATH" CANONICAL_VAULT_PATH="$CANONICAL_VAULT_PATH" npm run uat) | tee -a "$LOG_FILE"
}

execute() {
  if [[ "$UAT_STATIC_ONLY" == "1" ]]; then
    execute_static
  else
    execute_live_api
    seed_uat_browser_data
    export_temporal_history
    execute_cucumber
  fi
}

capture() {
  log 'capture: begin'
  if [[ "$UAT_START_STACK" == "1" ]]; then
    compose ps >>"$LOG_FILE" 2>&1 || true
    compose logs --tail "${UAT_LOG_TAIL:-200}" >>"$LOG_FILE" 2>&1 || true
  fi
  export_temporal_history
  snapshot_vault after
  assert_vault_unchanged
  scan_temporal_history
  write_summary
  log "capture: artifacts in $UAT_ARTIFACT_DIR"
}

teardown() {
  log 'teardown: begin'
  if [[ -f "$UAT_ARTIFACT_DIR/pi-bridge.pid" ]]; then
    kill "$(cat "$UAT_ARTIFACT_DIR/pi-bridge.pid")" >/dev/null 2>&1 || true
  fi
  pkill -f 'uvicorn uat.pi_openai_bridge.pi_openai_bridge' >/dev/null 2>&1 || true
  if [[ "$UAT_START_STACK" == "1" && "$UAT_TEARDOWN" == "1" ]]; then
    compose down -v >>"$LOG_FILE" 2>&1 || true
  fi
  log 'teardown: complete'
}

all() {
  trap 'status=$?; capture || true; teardown || true; exit $status' ERR INT TERM
  setup
  execute
  capture
  teardown
}

case "${1:-all}" in
  setup) setup ;;
  execute) execute ;;
  capture) capture ;;
  teardown) teardown ;;
  all) all ;;
  *) echo "usage: $0 [setup|execute|capture|teardown|all]" >&2; exit 2 ;;
esac
