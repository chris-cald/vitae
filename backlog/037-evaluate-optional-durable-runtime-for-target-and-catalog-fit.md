---
id: wi-037
title: Evaluate Optional Durable Runtime for Target and Catalog Fit
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: planned
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

Decide whether WI-023’s implemented Target/Catalog Fit flow benefits from opt-in durable execution without blocking its contract or fixture work.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Measure run duration/failure/review needs with synthetic cases, define an opt-in adapter if justified, and record adoption or non-adoption evidence.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Decision record, optional vertical slice only if justified, and compatibility/security test evidence.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [ ] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [ ] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [ ] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [ ] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- The item closes with a documented adopt/defer decision; any adopted path preserves WI-023 synchronous/contract behavior and passes payload redaction tests.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No modification to WI-023 dependencies, semantics, or mandatory delivery scope.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-023, WI-031
- `implements`: ADR-0004
