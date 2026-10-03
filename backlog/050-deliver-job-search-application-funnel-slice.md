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

- [ ] Complete WI-051 to persist/read the minimum application-bundle records.
- [ ] Complete WI-052 to enforce generation-source eligibility before resume/communication generation.
- [ ] Complete WI-053 to assemble draft markdown application artifacts and manifest in Vitae-controlled storage.
- [ ] Keep canonical Obsidian vault access read-only or out of scope for this slice.
- [ ] Update frontend/API docs to show the new natural process flow.

## Deliverables

- Application-funnel backend API/service slice.
- Source-eligibility guardrail for generation inputs.
- Draft bundle generator for JD note, tailored resume note, role manifest, unsupported claims, and next action.
- Focused tests and updated docs.

## Acceptance Criteria

- [ ] A user can create a draft application bundle from an existing target/job and selected resume/profile inputs.
- [ ] Bundle output includes JD note, resume draft, manifest, source summary, unsupported claims, and recommended follow-up.
- [ ] Draft generation cannot use Seeds, Tests, Work Orders, or draft Career Knowledge artifacts as factual/writing sources.
- [ ] No slice writes to the canonical Obsidian vault.
- [ ] `dv backlog validate --dir backlog --fail-on error` passes.

## Relationships

- `parent`: WI-047
- `depends_on`: WI-048
- `references`: docs/career/canonical-domain-model.md, docs/prd/mvp-book-of-work-to-application-loop.md
