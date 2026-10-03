---
id: wi-040
title: Complete Production Hardening and Temporal Adoption Decision
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: self-hosted-first MVP/UAT evidence accepted 2026-09-30; production rollout remains excluded without separate approval
priority: high
estimated: 5
links:
  parent:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  depends_on:
    - '[[032-deliver-opt-in-async-job-fit-vertical-slice]]'
    - '[[033-build-human-review-signal-bridge]]'
    - '[[034-implement-durable-harvest-runtime-slice]]'
    - '[[035-implement-durable-cull-and-prime-runtime-slice]]'
    - '[[036-implement-substantiation-and-guarded-catalog-publication]]'
    - '[[037-implement-required-durable-runtime-for-target-and-catalog-fit]]'
    - '[[038-implement-required-durable-runtime-for-deliverable-generation]]'
    - '[[039-implement-required-scheduled-application-automation-for-wi-026]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Complete the evidence-based production readiness gate for the self-hosted-first Temporal posture, preserving an option to migrate to Temporal Cloud after evidence warrants it.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Review threat model, incident/recovery drills, replay/version tests, backup/retention, observability, capacity/cost, support ownership, and all required MVP runtime-slice evidence.
- Verify UAT no-write evidence for `~/Obsidian Vaults/loft/1 Projects/Job Search/`.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Production-readiness report, self-hosted-first runbooks, Cloud migration criteria, acceptance sign-off, rollback plan, and canonical-vault no-write evidence.
- UAT artifact bundle containing Temporal history inspection, retry/restart/cancel/human-wait evidence, provider/browser UAT result, and canonical-vault before/after inventory diff.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Decision

- Start with self-hosted Temporal for MVP/UAT.
- Preserve a future migration path to Temporal Cloud if operations, reliability, support, data-residency, or cost evidence justifies it.
- Use the local OpenAI-compatible Pi bridge for synthetic model-provider UAT evidence when external provider credentials are not used.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Synthetic disaster/replay, access-control, payload-redaction, idempotency, and operational recovery evidence must pass; unresolved PII stop conditions block adoption.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## 2026-09-30 MVP/UAT readiness evidence

Decision owner sign-off: self-hosted Temporal is accepted for MVP/UAT based on the local evidence below. Production rollout is still excluded without a separate deployment approval.

Artifact bundle: `artifacts/uat/20260930T175726Z-live/`

Run configuration:

```sh
UAT_ARTIFACT_DIR="$PWD/artifacts/uat/20260930T175726Z-live" \
UAT_START_STACK=1 \
UAT_STATIC_ONLY=0 \
UAT_RUN_CUCUMBER=1 \
UAT_INSTALL_PLAYWRIGHT_BROWSERS=0 \
UAT_TEARDOWN=0 \
UAT_COMPOSE_FILE="$PWD/compose.local.yml" \
UAT_PROJECT=vitae-local \
CANONICAL_VAULT_PATH="$HOME/Obsidian Vaults/loft/1 Projects/Job Search" \
scripts/uat-local.sh all
```

Evidence recorded:

- Live API UAT passed for five required workflow types: `book-of-work-refresh`, `curation`, `target-catalog-fit`, `deliverable-generation`, and `application-automation`.
- Browser/provider UAT passed: Cucumber reported `10 scenarios (10 passed)` and `63 steps (63 passed)` against local backend/frontend and the local Pi OpenAI-compatible bridge.
- Temporal history was exported from the real local Temporal server/worker to `temporal-history.json` and passed `assert_no_forbidden_temporal_history(...)`.
- Human-wait approval and cancellation were exercised through `/api/v1/runtime-executions/{id}/decision` and `/cancel`; public responses retained opaque status fields only.
- Canonical vault before/after hashed inventories were recorded as `vault-before.json` and `vault-after.json`; `assert_no_vault_inventory_changes(...)` passed.
- Static pre-UAT checks also passed in `artifacts/uat/20260930T175217Z-static/`: `24 passed`, frontend UAT smoke tests passed, syntax checks passed.

Operational posture:

- Self-hosted-first remains the MVP/UAT choice.
- Temporal remains a substrate only; Vitae keeps canonical domain, scoring, promotion, authorization, and WorkItem authority.
- Cloud migration remains an option only if later operations, reliability, data-residency, support, or cost evidence justifies it.
- Rollback for MVP/UAT is to disable the worker/API Temporal path, keep the synchronous fallback, preserve minimal opaque evidence, and reconcile RuntimeExecution ledger state before retrying side effects.

## Exclusions

- No automatic production rollout without explicit decision-owner approval.
- No UAT path may write to the canonical Obsidian vault; use read-only mounts, snapshots, or Vitae test storage.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-032, WI-033, WI-034, WI-035, WI-036, WI-037, WI-038, WI-039
- `implements`: ADR-0004
