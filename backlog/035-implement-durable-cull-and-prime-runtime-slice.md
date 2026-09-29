---
id: wi-035
title: Implement Durable Cull and Prime Runtime Slice
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
    - '[[033-build-human-review-signal-bridge]]'
    - '[[034-implement-durable-harvest-runtime-slice]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Execute WI-022 Cull and Prime stages durably, requiring Vitae-authorized review for destructive Cull decisions.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Implement safe candidate grouping/diagnostics, approval waits for discard/merge/split decisions, and deterministic continuation into Prime.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Cull/Prime workflow/Activities, human-review integration, synthetic fixtures, and replay/idempotency tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Tests prove destructive dispositions cannot proceed without authorized approval, retries do not duplicate decisions, and stage order/diagnostics remain schema-valid.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No CatalogAsset publication or scoring-policy change.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-033, WI-034
- `implements`: ADR-0004
