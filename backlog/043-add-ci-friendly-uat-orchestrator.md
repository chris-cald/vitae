---
id: wi-043
title: Add CI-Friendly Local UAT Orchestrator
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 2
links:
  parent:
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
tags:
  - uat
  - ci
  - podman
  - privacy
---

## Goal

Provide a setup/execute/capture/teardown script for local UAT evidence that can be reused in CI with environment-variable changes only.

## Deliverables

- [x] `scripts/uat-local.sh` with `setup`, `execute`, `capture`, `teardown`, and `all` phases.
- [x] Optional Podman compose stack at `uat/podman-compose.yml` for Temporal, backend, worker, and frontend.
- [x] Sanitized artifact capture under ignored `artifacts/uat/`.
- [x] Static smoke coverage proving the script remains wired into docs.
- [x] UAT readiness docs showing local and CI usage.

## Acceptance Criteria

- [x] Default run is safe and does not require live services.
- [x] Live run can be enabled with env vars: `UAT_START_STACK=1`, `UAT_STATIC_ONLY=0`, and optional `UAT_RUN_CUCUMBER=1`.
- [x] Canonical vault inventory capture uses hashed paths only.
- [x] Temporal history scanning uses the existing forbidden-evidence helper.

## Test and Evidence

- `scripts/uat-local.sh all`
- `cd frontend && node --test test/uat-orchestrator-smoke.test.mjs`
- `dv backlog validate --dir backlog --fail-on error`
