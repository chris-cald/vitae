---
id: wi-057
title: Run Live Full-Loop MVP UAT
summary: Produce release evidence for the complete source-inventory-to-application-to-refresh loop in a real Temporal and browser environment.
type: work-item
subtype: story
lifecycle: active
status: planned
status_reason: blocked-by-dependency
priority: critical
estimated: 3
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[054-add-career-inventory-and-curation-slice]]'
    - '[[056-connect-career-refresh-and-runtime-ux]]'
  reference:
    - '[[../docs/uat-readiness]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
tags:
  - hitl
  - p0
  - uat
  - temporal
  - privacy
  - release
---

## Goal

Validate the complete candidate loop against live backend, browser, and Temporal services using only sanitized fixtures and evidence that the canonical vault was not changed.

## Tasks

- [ ] Run two concurrent, isolated application journeys from inventory to guarded bundle and material application event.
- [ ] Demonstrate one harvest/cull/prime/substantiate iteration and one source refresh or stale-state outcome, obtaining an approved `discard`, `merge`, or `split` decision immediately before live cull, and an approved `publish-catalog-asset` decision plus the Seed promotion guard immediately before CatalogAsset publication.
- [ ] Capture real Temporal start, retry/restart, cancellation, human-wait, and opaque-history evidence.
- [ ] Record pre/post canonical-vault inventories as hashed relative paths, size, and mtime only; require an empty diff and never expose filenames.
- [ ] Record only sanitized evidence and close the parent epic when every acceptance criterion is met.

## Acceptance Criteria

- [ ] All seven full-UAT pass criteria in `docs/uat-readiness.md` are evidenced against live services.
- [ ] Two applications are isolated end to end.
- [ ] Temporal history, logs, metrics, and fixtures contain no protected raw material.
- [ ] Canonical-vault inventory uses hashed relative paths only and its diff is empty.
- [ ] Release rehearsal, `npm run check`, `npm run pilot:rehearse`, and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-054
- `depends_on`: WI-056
- `references`: docs/uat-readiness.md, docs/prd/mvp-book-of-work-to-application-loop.md
