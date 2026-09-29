---
id: wi-034
title: Implement Durable Harvest Runtime Slice
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 5
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

Execute the WI-022 Harvest stage durably using existing source, Seed, and candidate-Evidence contracts.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Invoke harvest services in idempotent Activities, persist safe stage status and diagnostics, and retain existing AFK/HITL boundary.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Harvest workflow/Activities, synthetic end-to-end fixture, idempotency tests, and operational runbook updates.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Tests cover retry without duplicate Seeds, source-backed outputs, safe diagnostics, cancellation, and prohibition of raw source/model material in Temporal.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No destructive Cull, Catalog publication, or change to Seed promotion rules.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-029, WI-030, WI-031
- `implements`: ADR-0004
