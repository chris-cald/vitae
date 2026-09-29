---
id: wi-037
title: Implement Required Durable Runtime for Target and Catalog Fit
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
    - '[[023-implement-target-requirement-projection-and-catalog-fit-slice]]'
    - '[[031-implement-idempotent-runtimeexecution-ledger-and-safe-status-api]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Implement the durable Target/Catalog Fit runtime path required for expanded MVP UAT while preserving WI-023 contract and fixture behavior.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Measure run duration/failure/review needs with synthetic cases, define the adapter, and record implementation evidence.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Prove UAT does not create, modify, delete, rename, or rewrite canonical files/catalog under `~/Obsidian Vaults/loft/1 Projects/Job Search/`.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Decision record, required vertical slice for MVP UAT, and compatibility/security test evidence.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- The item closes with a documented implementation decision; the implemented path preserves WI-023 synchronous/contract behavior and passes payload redaction tests.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No modification to WI-023 dependencies, semantics, or mandatory delivery scope.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-023, WI-031
- `implements`: ADR-0004
