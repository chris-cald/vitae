# MVP UAT Readiness

## Scope

UAT covers the expanded MVP path:

1. multiple concurrent Targets/job descriptions/Applications;
2. iterative Book of Work curation through harvest, cull, prime, and substantiate;
3. realtime incorporation of out-of-band Book of Work changes;
4. Temporal-backed durable execution for the above paths using the ADR-0004 privacy boundary;
5. existing resume/job/job-fit flows when a live backend and model provider are configured.

The synchronous `GET /api/v1/mvp/application-loop/demo` endpoint remains a smoke check only. It is not sufficient for full MVP UAT.

## Required local checks

```sh
cd backend
.venv/bin/python -m pytest -q

cd ../frontend
npm test

cd ..
node --test schemas/career/test/canonical-domain-contract.test.mjs
dv backlog validate --dir backlog --fail-on error
git diff --check
```

Expected baseline without a live backend: backend unit tests pass and live integration tests skip.

## Environment

Copy examples before running services:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set provider credentials only in local `.env` files. Do not commit raw resumes, job descriptions, prompts, completions, API keys, or upload contents.

## Runtime execution boundary

`POST /api/v1/runtime-executions` uses the real Temporal adapter only when `TEMPORAL_ADDRESS` is configured; otherwise it uses the validating local adapter. Live Temporal UAT evidence must create the runtime execution through this API and inspect that workflow history. Local/static checks prove payload shape and redaction only; they are not live Temporal evidence.

## Canonical vault no-write rule

Full UAT must not alter canonical files or Catalog content under:

```text
~/Obsidian Vaults/loft/1 Projects/Job Search/
```

Use a read-only mount or disposable snapshot for UAT. Any importer, watcher, Temporal Activity, or manual test must write only to Vitae test storage or a copied fixture tree. A UAT run fails if files under the canonical path are created, modified, deleted, renamed, or rewritten.

## Full UAT pass criteria

Full MVP UAT passes only when:

1. at least two concurrent Applications are active and isolated from each other;
2. each Application links its Target, Requirements, FitAnalysis, Deliverables, Records, and status;
3. at least one curation iteration promotes or rejects material through harvest/cull/prime/substantiate;
4. an out-of-band Book of Work change is detected and incorporated or safely flagged stale;
5. the Temporal path survives retry/restart/cancellation and human-wait behavior with opaque payloads only;
6. no UAT step mutates the canonical Obsidian vault path above;
7. logs, errors, Temporal history, metrics, and fixtures contain no raw resume/JD/prompt/completion/secret/reviewer prose.

## Live Temporal evidence

For full UAT, run against a real Temporal server and worker. Record evidence for:

1. start: a runtime execution starts with only opaque IDs in workflow input;
2. retry/restart: worker restart or retry resumes without duplicate side effects;
3. cancellation: cancelling a runtime execution reaches a terminal safe status;
4. human wait: approval/rejection is delivered as an opaque Signal only;
5. history inspection: exported Temporal history, search attributes, memos, logs, and metrics contain no resume/JD text, prompt, completion, secret, reviewer prose, filename, URL, or vault path.

A run fails if Temporal history or observability contains anything outside the ADR-0004 allowlist. The local helper `src.services.uat_evidence.assert_no_forbidden_temporal_history(...)` can validate exported synthetic history JSON; it does not create live Temporal evidence.

## Canonical vault no-write evidence

Before UAT, record an inventory of the canonical vault path using hashed relative paths, size, and mtime. After UAT, record the same inventory and diff it. The diff must be empty. If a read-only mount is available, prefer it and keep the mount command or platform setting as evidence. The local helpers `snapshot_file_inventory(...)` and `assert_no_vault_inventory_changes(...)` in `src.services.uat_evidence` validate this evidence without reading file contents or exposing filenames.

## Local setup/execute/capture/teardown runner

Preferred local/CI entrypoint:

```sh
scripts/uat-local.sh all
```

Default mode is safe/static: it runs focused contract checks, captures sanitized artifacts under `artifacts/uat/<timestamp>/`, and tears down anything it started. For live Podman UAT:

```sh
UAT_START_STACK=1 \
UAT_STATIC_ONLY=0 \
UAT_USE_PI_BRIDGE=1 \
UAT_RUN_CUCUMBER=1 \
CANONICAL_VAULT_PATH="$HOME/Obsidian Vaults/loft/1 Projects/Job Search" \
scripts/uat-local.sh all
```

CI can reuse the same script by setting `UAT_ARTIFACT_DIR`, `BACKEND_PYTHON`, `UAT_START_STACK`, `UAT_STATIC_ONLY`, `UAT_RUN_CUCUMBER`, `UAT_TEARDOWN`, `UAT_API_URL`, and `UAT_FRONTEND_URL`. The compose file is `uat/podman-compose.yml`; replace or override it with `UAT_COMPOSE_FILE` if CI needs hosted services instead of local Podman.

## Local Playwright/Cucumber fixture

Optional operator fixture:

```sh
cd uat/playwright-cucumber
npm install
PLAYWRIGHT_BASE_URL=http://localhost:5173 \
VITAE_API_URL=http://localhost:8000 \
CANONICAL_VAULT_PATH="$HOME/Obsidian Vaults/loft/1 Projects/Job Search" \
TEMPORAL_HISTORY_PATH=../../artifacts/uat/temporal-history.json \
npm run uat
```

This fixture is tracked by WI-042 and is intended for Podman-hosted local services. For local provider UAT, run the lightweight OpenAI-compatible bridge in `uat/pi_openai_bridge` and point LiteLLM at it with `LLM_MODEL=openai/pi-local`, `LITELLM_API_BASE=http://127.0.0.1:8787/v1`, and `LITELLM_API_KEY=local-pi-bridge`.

## Live provider/browser UAT

With local `.env` files configured and no raw private data committed:

1. start backend and frontend;
2. use sanitized sample resume/job material;
3. upload/select at least one resume and two target jobs;
4. create fit analyses and expanded MVP runtime executions;
5. confirm the browser shows isolated application state for each target;
6. confirm generated/returned material remains source-backed or human-confirmation flagged;
7. confirm backend/frontend errors do not include raw input text.

If neither provider credentials nor the local Pi bridge are configured, this section is not passed; local unit checks are only pre-UAT readiness.

## Manual smoke

Terminal 1:

```sh
cd backend
.venv/bin/uvicorn src.main:app --reload
```

Terminal 2:

```sh
curl http://localhost:8000/api/v1/mvp/application-loop/demo
```

Pass criteria: response includes a Target, FitAnalysis, at least one Misalignment, a source-backed Deliverable, and an Application linking the Target and Deliverable. This proves contract shape only, not full UAT readiness.

## Deployment note

The included Dockerfiles/compose files are development conveniences. For hosted UAT, run the backend behind an API host/reverse proxy, serve the frontend production build, and provide environment-specific secrets through the platform secret store.
