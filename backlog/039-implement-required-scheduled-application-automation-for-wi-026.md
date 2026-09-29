---
id: wi-039
title: Implement Required Scheduled Application Automation for WI-026
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
    - '[[026-track-one-application-with-lightweight-material-records]]'
    - '[[031-implement-idempotent-runtimeexecution-ledger-and-safe-status-api]]'
    - '[[033-build-human-review-signal-bridge]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Implement the scheduled durable Application automation path required for expanded MVP UAT while preserving Notes and application records as Vitae data.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Assess reminders, follow-up timing, authorization, cancellation, retention, and safe status needs; implement an evidence-backed required schedule path.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Prove UAT does not create, modify, delete, rename, or rewrite canonical files/catalog under `~/Obsidian Vaults/loft/1 Projects/Job Search/`.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Decision record, required schedule path for MVP UAT, authorization/cancellation/redaction tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- The item closes with implementation evidence; the implemented schedule has explicit consent, cancellation, tenant isolation, and no note/reviewer prose in Temporal.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No modification to WI-026 dependencies, Application/Note semantics, or automatic external communication.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-026, WI-031, WI-033
- `implements`: ADR-0004
