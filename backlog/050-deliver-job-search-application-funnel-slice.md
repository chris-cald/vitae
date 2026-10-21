---
id: wi-050
title: Deliver Job Search Application Funnel Slice
summary: Add the smallest product vertical slice that turns the Job Search ChatGPT process into a Vitae application bundle workflow.
type: work-item
subtype: epic
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 8
links:
  parent:
    - '[[047-complete-p0-reconciliation]]'
  depends_on:
    - '[[048-refresh-p0-source-of-truth-docs]]'
  reference:
    - '[[../docs/career/canonical-domain-model]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
tags:
  - hitl
  - p0
  - application-funnel
  - job-search
  - deliverables
  - career-knowledge
---

## Goal

Ship the smallest end-to-end flow that matches the Job Search stopgap process: capture the opportunity, select validated support, assemble draft deliverables, record unsupported claims, and create an application manifest without mutating the canonical Obsidian vault.

## Background

The current app supports resume/job upload and job-fit analysis. The Job Search ChatGPT process requires a fuller application bundle: captured Job Description markdown note, tailored Resume markdown note, role-level deliverable manifest, sources used, unsupported claims, and recommended follow-up. Canonical schemas and templates exist, but the product flow does not yet use them.

## Tasks

- [x] Complete WI-051 to persist/read the minimum application-bundle records.
- [x] Complete WI-052 to enforce generation-source eligibility before resume/communication generation.
- [x] Complete WI-053 to assemble draft markdown application artifacts and manifest in Vitae-controlled storage.
- [ ] Complete WI-054 to add the source inventory and human-reviewed curation loop.
- [ ] Complete WI-055 to expose the bundle workflow and material events in the frontend.
- [ ] Complete WI-056 to connect refresh and durable runtime UX.
- [ ] Complete WI-057 to collect live full-loop UAT evidence and release readiness.
- [ ] Keep canonical Obsidian vault access read-only or out of scope for this slice.

## Deliverables

- Application-funnel backend API/service slice.
- Source-eligibility guardrail for generation inputs.
- Draft bundle generator for JD note, tailored resume note, role manifest, unsupported claims, and next action.
- Focused tests and updated docs.

## Acceptance Criteria

- [ ] A user can create, review, and record material events for a draft application bundle from an existing target/job and selected resume/profile inputs.
- [ ] Bundle output includes JD note, resume draft, manifest, source summary, unsupported claims, and recommended follow-up.
- [ ] Draft generation cannot use Seeds, Tests, Work Orders, or draft Career Knowledge artifacts as factual/writing sources.
- [ ] A user can inventory source material, complete a reviewed curation cycle, and see refresh or stale state without canonical-vault writes.
- [ ] Live UAT validates two isolated applications, real Temporal behavior, privacy controls, and no canonical-vault mutation.
- [ ] `dv backlog validate --dir backlog --fail-on error` passes.

## Relationships

- `parent`: WI-047
- `depends_on`: WI-048
- `references`: docs/career/canonical-domain-model.md, docs/prd/mvp-book-of-work-to-application-loop.md
