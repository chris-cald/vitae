---
id: wi-047
title: Complete P0 Reconciliation
summary: Close the critical gaps between current implementation, canonical Vitae planning, and the Job Search ChatGPT application workflow before lower-priority roadmap work proceeds.
type: work-item
subtype: epic
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 13
links:
  depends_on:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
  reference:
    - '[[../docs/wayfinder/vitae-mvp-map]]'
    - '[[../docs/career/canonical-domain-model]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/uat-readiness]]'
tags:
  - hitl
  - p0
  - reconciliation
  - mvp
  - temporal
  - job-search
---

## Goal

Bring the repository back to a single critical-path truth: docs, backlog, runtime behavior, UAT evidence, and user-facing application flow must agree on what is implemented, what is contract-only, and what remains planned.

## Background

The critical alignment review found three P0 drifts:

1. Wayfinder and planning docs still describe the Temporal live-evidence gate as open even though WI-040 records accepted MVP/UAT evidence.
2. Runtime execution docs imply a completed Temporal-backed API path, but `RuntimeExecutionService` defaults to `LocalTemporalAdapter`; live UAT starts Temporal workflows separately through the harness.
3. The user-facing app still follows the older resume/job-fit flow and does not yet implement the Job Search application funnel: captured JD note, tailored resume note, deliverable manifest, source summary, unsupported claims, and follow-up.

## Tasks

- [ ] Complete WI-048 so readers and agents start from accurate source-of-truth docs.
- [ ] Complete WI-049 so runtime execution behavior and UAT evidence tell the same story.
- [ ] Complete WI-050 and its child stories so the product has a real application-funnel vertical slice.
- [ ] Rerun the critical alignment review after all child stories complete and update this epic with the remaining frontier.

## Deliverables

- Updated planning/navigation docs with no stale P0 blockers.
- Runtime execution path and evidence that match documented claims.
- Application-funnel vertical slice aligned with the Job Search ChatGPT process.
- Follow-up alignment review results captured in docs or this epic.

## Acceptance Criteria

- [ ] No P0 item in the reconciliation review remains untracked by a child story.
- [ ] `docs/wayfinder/vitae-mvp-map.md`, WI-027, WI-040, and `docs/uat-readiness.md` agree on Temporal/UAT status.
- [ ] Runtime API behavior is either Temporal-backed under configured Temporal settings or explicitly documented as local-adapter-only.
- [ ] The product can produce a draft application bundle with a captured JD, tailored resume draft, manifest, source summary, unsupported claims, and next action.
- [ ] Validation evidence is recorded on completed child stories.

## Relationships

- `depends_on`: WI-027
- `depends_on`: WI-040
- `references`: docs/wayfinder/vitae-mvp-map.md, docs/career/canonical-domain-model.md, docs/prd/mvp-book-of-work-to-application-loop.md, docs/uat-readiness.md
