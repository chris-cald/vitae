---
id: wi-031
title: Implement Idempotent RuntimeExecution Ledger and Safe Status API
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: planned
priority: high
estimated: 5
links:
  parent:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  depends_on:
    - '[[029-build-runtime-execution-adapter-and-pii-safe-payload-contract]]'
    - '[[030-create-isolated-temporal-worker-bootstrap-and-configuration-seam]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Persist Vitae-owned RuntimeExecution correlation, safe status, and idempotency state without using Temporal history as the product audit store.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Design migrations, ledger lifecycle, idempotency keys, outbox/inbox reconciliation, authorization checks, and a read-only safe status API.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- SQLModel ledger, migration, idempotency/reconciliation service, authorized safe-status API, and tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [ ] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [ ] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [ ] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [ ] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Integration tests cover duplicate starts, retry/recovery, tenant isolation, authorization, and status payload redaction; no raw content is returned or logged.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No AI-stage logic, scoring change, or human-review UI.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-029, WI-030
- `implements`: ADR-0004
