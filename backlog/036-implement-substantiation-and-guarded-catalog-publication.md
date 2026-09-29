---
id: wi-036
title: Implement Substantiation and Guarded Catalog Publication
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
    - '[[035-implement-durable-cull-and-prime-runtime-slice]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Execute Substantiate and CatalogAsset publication only after existing promotion guards and Vitae-authorized approval pass.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Run source/evidence/promotion validation before side effects, wait for approval, publish idempotently, and reconcile partial failures.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Substantiation workflow/Activities, publication adapter, approval integration, and guard/recovery tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Tests prove invalid/missing evidence, direct Seed-to-Projection promotion, and unapproved publication fail before side effects; valid publication is exactly-once from Vitae perspective.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No new Catalog semantics, automatic policy override, or Deliverable generation.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-033, WI-035
- `implements`: ADR-0004
