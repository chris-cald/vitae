---
id: wi-049
title: Align Runtime Execution Temporal Truth
summary: Make runtime execution API behavior, Temporal worker behavior, and UAT evidence agree without leaking PII or overstating what is implemented.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: runtime API Temporal boundary aligned and independently reviewed
priority: critical
estimated: 3
links:
  parent:
    - '[[047-complete-p0-reconciliation]]'
  depends_on:
    - '[[048-refresh-p0-source-of-truth-docs]]'
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
  reference:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
    - '[[../docs/uat-readiness]]'
tags:
  - afk
  - p0
  - temporal
  - runtime-execution
  - uat
  - privacy
---

## Goal

Eliminate the mismatch between completed Temporal adoption claims and the current default `LocalTemporalAdapter` runtime execution path.

## Background

The live UAT harness can run a real local Temporal worker and export opaque workflow history, but the FastAPI runtime-execution service currently instantiates a validating local adapter by default. That may be acceptable for local/dev fallback, but the docs and UAT evidence must not imply API-created executions are Temporal-backed unless they are.

## Tasks

- [x] Decide and document the runtime boundary: configured Temporal adapter with local fallback, or explicitly local-adapter-only until a later story.
- [x] If configured Temporal is selected, inject `TemporalExecutionAdapter` when Temporal settings are present and keep `LocalTemporalAdapter` as an intentional fallback.
- [x] Extend UAT evidence so at least one API-created runtime execution is verified against live Temporal history when Temporal is enabled.
- [x] Ensure public runtime responses continue to expose only opaque status fields.
- [x] Keep all Temporal inputs, signals, memos, search attributes, logs, and artifacts free of resume/JD/prompt/completion/secret/reviewer prose.

## Deliverables

- Runtime execution adapter wiring or explicit documentation downgrade.
- Focused tests for adapter selection and public response redaction.
- UAT evidence or documented exclusion matching the selected boundary.

## Acceptance Criteria

- [x] Runtime execution behavior matches the docs under both local and Temporal-enabled configurations.
- [x] API-created runtime executions are included in live Temporal evidence if the docs claim API Temporal backing.
- [x] `tests/test_runtime_execution_api.py` and adapter-focused tests pass.
- [x] UAT privacy inspection still rejects forbidden Temporal history content.
- [x] `dv backlog validate --dir backlog --fail-on error` passes.

## Completion notes

- Selected configured Temporal adapter with local fallback: `TEMPORAL_ADDRESS` enables `TemporalExecutionAdapter`; absent config keeps `LocalTemporalAdapter`.
- API runtime start/cancel/decision now use the configured service builder; GET remains ledger-only.
- `docs/uat-readiness.md` now requires live Temporal UAT evidence to create executions through the API and inspect that workflow history.
- Validation: focused runtime/UAT pytest suite passed (`50 passed`), frontend UAT orchestrator smoke passed, `scripts/uat-local.sh execute` passed, `git diff --check` passed, and `dv backlog validate --dir backlog --fail-on error` passed. Independent review approved with no findings.

## Relationships

- `parent`: WI-047
- `depends_on`: WI-048
- `depends_on`: WI-040
- `references`: docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate.md, docs/uat-readiness.md
