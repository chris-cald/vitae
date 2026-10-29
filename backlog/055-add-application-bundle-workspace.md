---
id: wi-055
title: Add Application Bundle Workspace
summary: Expose the existing guarded application-bundle API as a candidate-facing workspace for draft review, material status changes, and next actions.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: completed
priority: critical
completed_date: '2026-10-27'
commits:
  8133ca9eda4e0caf2b23361993c54072a531e04c: Guard application bundle workspace state (#8)
links:
  pull_requests:
    - https://github.com/chris-cald/vitae/pull/8
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[051-add-application-bundle-record-slice]]'
    - '[[052-enforce-generation-source-eligibility]]'
    - '[[053-generate-draft-application-bundle-artifacts]]'
  reference:
    - '[[051-add-application-bundle-record-slice]]'
    - '[[052-enforce-generation-source-eligibility]]'
    - '[[053-generate-draft-application-bundle-artifacts]]'
  evidence:
    - '[[record-wi-055-validation-passed]]'
    - '[[record-wi-055-historical-approval]]'
tags:
  - afk
  - p0
  - application-funnel
  - frontend
  - privacy
---

## Goal

Turn the existing draft-bundle backend slice into the minimal candidate workflow: choose a fit analysis, create a guarded draft bundle, review its artifacts and unsupported claims, and record material application events.

## Tasks

- [x] Add shared typed frontend API helpers for application bundles and material application records.
- [x] Add a bundle create/detail UI reachable from job-fit results and list existing bundles without cross-application bleed.
- [x] Expose an API route for the existing material-record service method; permit only submission, interview, decision, follow-up, and material-change events.
- [x] Render source summaries, unsupported claims, and next action without treating target context as candidate evidence.
- [x] Add focused API and browser-flow tests using synthetic data.

## Acceptance Criteria

- [x] A candidate can create and retrieve a draft bundle from a job-fit result.
- [x] Bundle detail shows the JD note, resume draft, manifest, source summary, unsupported claims, and recommended next action.
- [x] Material events can be added and listed; edits/autosaves/recalculations create no ApplicationRecord.
- [x] Two bundles remain isolated in UI and API responses.
- [x] `npm run check` and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-051
- `depends_on`: WI-052
- `depends_on`: WI-053
- `references`: WI-051, WI-052, WI-053
