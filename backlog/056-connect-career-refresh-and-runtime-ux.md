---
id: wi-056
title: Connect Career Refresh and Runtime UX
summary: Let candidates start, observe, cancel, and review privacy-safe durable execution for inventory refresh and application work.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: planned
priority: high
estimated: 5
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[055-add-application-bundle-workspace]]'
  reference:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
    - '[[../docs/uat-readiness]]'
tags:
  - afk
  - p0
  - temporal
  - refresh
  - privacy
  - runtime
---

## Goal

Connect the existing RuntimeExecution API to the inventory and application workspace so users can safely observe durable refresh and application automation without exposing resume, job-description, prompt, completion, filename, URL, or vault-path data.

## Tasks

- [x] Add an opt-in UI for start, status, cancellation, and human decisions using opaque runtime execution identifiers only.
- [x] Detect an out-of-band Book of Work source change and incorporate it or mark dependent inventory/application state stale; do not mutate canonical vault files.
- [x] Reuse the existing runtime execution contract and Temporal adapter rather than adding a parallel job system.
- [x] Add focused contract and browser-flow tests for status, cancellation, and stale-state presentation.

## Acceptance Criteria

- [x] A user can start and observe a refresh or application runtime execution from the workspace.
- [x] A user can cancel an active execution and submit an allowed human decision.
- [x] UI/API responses and test fixtures contain opaque IDs and status only, never raw protected material.
- [x] An out-of-band Book of Work change is surfaced as incorporated or stale without canonical-vault writes.
- [x] `npm run check` and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-055
- `references`: ADR-0004, docs/uat-readiness.md
