---
id: wi-039
title: Evaluate Optional Scheduled Application Automation for WI-026
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

Decide whether WI-026 application tracking needs opt-in scheduled durable automation while preserving Notes and application records as Vitae data.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Assess reminders, follow-up timing, authorization, cancellation, retention, and safe status needs; implement only an evidence-backed optional schedule path.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Decision record, optional schedule path only if justified, authorization/cancellation/redaction tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [ ] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [ ] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [ ] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [ ] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- The item closes with adopt/defer evidence; any adopted schedule has explicit consent, cancellation, tenant isolation, and no note/reviewer prose in Temporal.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No modification to WI-026 dependencies, Application/Note semantics, or automatic external communication.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-026, WI-031, WI-033
- `implements`: ADR-0004
