---
id: wi-040
title: Complete Production Hardening and Temporal Adoption Decision
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
    - '[[032-deliver-opt-in-async-job-fit-vertical-slice]]'
    - '[[033-build-human-review-signal-bridge]]'
    - '[[034-implement-durable-harvest-runtime-slice]]'
    - '[[035-implement-durable-cull-and-prime-runtime-slice]]'
    - '[[036-implement-substantiation-and-guarded-catalog-publication]]'
    - '[[037-evaluate-optional-durable-runtime-for-target-and-catalog-fit]]'
    - '[[038-evaluate-optional-durable-runtime-for-deliverable-generation]]'
    - '[[039-evaluate-optional-scheduled-application-automation-for-wi-026]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Make the evidence-based production adoption decision, including Temporal Cloud versus self-hosted, only after foundation and runtime-slice evidence is complete.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Review threat model, incident/recovery drills, replay/version tests, backup/retention, observability, capacity/cost, support ownership, and all optional-slice decisions.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Production-readiness report, Cloud/self-hosted decision or explicit deferment, runbooks, acceptance sign-off, and rollback plan.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [ ] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [ ] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [ ] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [ ] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Synthetic disaster/replay, access-control, payload-redaction, idempotency, and operational recovery evidence must pass; unresolved PII stop conditions block adoption.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No automatic production rollout or provider selection without explicit decision-owner approval.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-032, WI-033, WI-034, WI-035, WI-036, WI-037, WI-038, WI-039
- `implements`: ADR-0004
