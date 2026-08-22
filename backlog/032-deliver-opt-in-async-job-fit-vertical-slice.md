---
id: wi-032
title: Deliver Opt-In Async Job-Fit Vertical Slice
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
    - '[[009-remove-pii-bearing-model-logs]]'
    - '[[029-build-runtime-execution-adapter-and-pii-safe-payload-contract]]'
    - '[[030-create-isolated-temporal-worker-bootstrap-and-configuration-seam]]'
    - '[[031-implement-idempotent-runtimeexecution-ledger-and-safe-status-api]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Add an opt-in durable job-fit execution path while preserving the existing synchronous endpoint and its response contract.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Route approved opaque input references through the adapter, invoke existing Vitae job-fit services in idempotent Activities, and expose safe execution status.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Opt-in API contract, worker workflow/Activities, status integration, synthetic end-to-end tests, and migration/rollback notes.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [ ] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [ ] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [ ] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [ ] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Tests prove the synchronous endpoint is unchanged, async execution is opt-in, retries are idempotent, and payload/log/history assertions prevent PII leakage.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No replacement of synchronous job-fit, scoring-policy change, or raw document transport through Temporal.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-009, WI-029, WI-030, WI-031
- `implements`: ADR-0004
