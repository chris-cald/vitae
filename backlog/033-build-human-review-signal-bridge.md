---
id: wi-033
title: Build Human-Review Signal Bridge
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 3
links:
  parent:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  depends_on:
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

Bridge Vitae-owned authorized human decisions to durable execution without storing reviewer prose in Temporal.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Implement approval/rejection endpoints, role and tenant checks, decision audit persistence, opaque decision signals, timeout/cancellation handling, and replay-safe tests.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Approval API/service, decision audit record, signal adapter, workflow waiting contract, and tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Tests cover unauthorized actors, stale/duplicate decisions, resume after worker failure, and a redaction assertion that reviewer prose never reaches Temporal surfaces.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No review UI redesign or automatic promotion policy.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-029, WI-030, WI-031
- `implements`: ADR-0004
