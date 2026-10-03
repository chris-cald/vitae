---
id: wi-048
title: Refresh P0 Source-of-Truth Docs
summary: Update Wayfinder, UAT readiness, and historical research/planning notes so they accurately distinguish completed evidence, implemented behavior, and planned reconciliation work.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: source-of-truth docs refreshed and validated
priority: critical
estimated: 2
links:
  parent:
    - '[[047-complete-p0-reconciliation]]'
  depends_on:
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
  reference:
    - '[[../docs/wayfinder/vitae-mvp-map]]'
    - '[[../docs/uat-readiness]]'
    - '[[../research]]'
tags:
  - afk
  - p0
  - documentation
  - wayfinder
  - uat
  - reconciliation
---

## Goal

Make repository navigation truthful before more implementation work starts.

## Background

`docs/wayfinder/vitae-mvp-map.md` still lists the Temporal live evidence gate as blocking even though WI-040 records accepted MVP/UAT evidence. `research.md` is useful historical analysis, but it contains a Temporal Cloud preference that is superseded by the self-hosted-first MVP/UAT decision. `NEXT-STEPS.md` describes Temple/linter work and is unrelated to the Vitae P0 path.

## Tasks

- [x] Update `docs/wayfinder/vitae-mvp-map.md` so WI-027/WI-040 are no longer described as open MVP blockers.
- [x] Add a concise current-state note that separates implemented, UAT-evidenced, contract-only, and planned product capabilities.
- [x] Mark `research.md` as superseded by ADR-0004/WI-040 where it conflicts with the accepted self-hosted-first MVP/UAT posture.
- [x] Mark or move `NEXT-STEPS.md` so it cannot be mistaken for the active Vitae product path.
- [x] Link WI-047 through WI-053 from the Wayfinder frontier.

## Deliverables

- Updated Wayfinder map.
- Current-state documentation note or equivalent section in existing docs.
- Supersession notes for stale research/non-Vitae next steps.

## Acceptance Criteria

- [x] A new agent can identify the active P0 frontier without reading old chat context.
- [x] No source-of-truth doc claims the Temporal live-evidence gate is still open after WI-040.
- [x] Historical research remains available but cannot override ADR-0004/WI-040.
- [x] `git diff --check` passes.
- [x] `dv backlog validate --dir backlog --fail-on error` passes.

## Relationships

- `parent`: WI-047
- `depends_on`: WI-040
- `references`: docs/wayfinder/vitae-mvp-map.md, docs/uat-readiness.md, research.md


## Completion notes

- Documentation-only change; TDD is not applicable.
- Updated Wayfinder/current-state sections so WI-027/WI-040 are no longer open MVP blockers and WI-047 through WI-053 are the active P0 frontier.
- Marked `research.md` as historical/superseded where it conflicts with ADR-0004/WI-040 and marked `NEXT-STEPS.md` as non-Vitae Temple/linter planning.
- Validation: `git diff --check` passed; `dv backlog validate --dir backlog --fail-on error` passed.
- Independent review approved with no findings.
