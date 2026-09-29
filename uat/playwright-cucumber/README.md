# Expanded MVP UAT fixture

Optional Playwright/Cucumber operator fixture for WI-040. It is intentionally outside the app packages so normal installs do not pull browser tooling.

## Model provider

For local UAT, use the lightweight OpenAI-compatible bridge in `../pi_openai_bridge` to route Vitae LiteLLM calls through the locally authenticated `pi` CLI. Use synthetic UAT material only and keep the bridge bound to localhost.

## Run

```sh
cd uat/playwright-cucumber
npm install
PLAYWRIGHT_BASE_URL=http://localhost:5173 \
VITAE_API_URL=http://localhost:8000 \
CANONICAL_VAULT_PATH="$HOME/Obsidian Vaults/loft/1 Projects/Job Search" \
TEMPORAL_HISTORY_PATH=../../artifacts/uat/temporal-history.json \
npm run uat
```

Use a read-only bind mount for `CANONICAL_VAULT_PATH` when running under Podman. Keep artifacts under `artifacts/uat/` or another ignored directory; never commit real resumes, job descriptions, prompts, completions, URLs, filenames, vault paths, or Temporal histories.

## Evidence captured

- Browser-visible job-fit path with synthetic generated files.
- Expanded MVP UAT API contract shape.
- Required RuntimeExecution workflow types, decision, and cancellation.
- Canonical vault before/after hashed inventory.
- Optional exported Temporal history privacy scan.

## Open WI-040 decision

The remaining decision is operational ownership: Temporal Cloud vs self-hosted/local production posture, including backup/retention, incident recovery, replay/versioning, access control, observability, cost/capacity, and support ownership. Local Podman evidence can satisfy technical UAT evidence, but it does not by itself choose or approve production operations.
