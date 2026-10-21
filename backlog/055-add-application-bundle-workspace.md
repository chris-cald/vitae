---
id: wi-055
title: Add Application Bundle Workspace
summary: Expose the existing guarded application-bundle API as a candidate-facing workspace for draft review, material status changes, and next actions.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: planned
priority: critical
estimated: 4
links:
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

- [ ] Add shared typed frontend API helpers for application bundles and material application records.
- [ ] Add a bundle create/detail UI reachable from job-fit results and list existing bundles without cross-application bleed.
- [ ] Expose an API route for the existing material-record service method; permit only submission, interview, decision, follow-up, and material-change events.
- [ ] Render source summaries, unsupported claims, and next action without treating target context as candidate evidence.
- [ ] Add focused API and browser-flow tests using synthetic data.

## Acceptance Criteria

- [ ] A candidate can create and retrieve a draft bundle from a job-fit result.
- [ ] Bundle detail shows the JD note, resume draft, manifest, source summary, unsupported claims, and recommended next action.
- [ ] Material events can be added and listed; edits/autosaves/recalculations create no ApplicationRecord.
- [ ] Two bundles remain isolated in UI and API responses.
- [ ] `npm run check` and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-051, WI-052, WI-053
- `references`: WI-051, WI-052, WI-053
