---
id: wi-054
title: Add Career Inventory and Curation Slice
summary: Let a candidate inventory source material, keep Seeds separate from CatalogAssets, and complete one source-backed harvest-to-substantiate loop.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: planned
priority: critical
estimated: 5
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[036-implement-substantiation-and-guarded-catalog-publication]]'
  reference:
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/career/canonical-domain-model]]'
tags:
  - hitl
  - p0
  - career-inventory
  - curation
  - provenance
  - privacy
---

## Goal

Add the smallest persisted, user-visible Career Inventory that turns Vitae-controlled source metadata into candidate Seeds and validated CatalogAssets without copying raw Book of Work content into telemetry or mutating the canonical Obsidian vault.

## Tasks

- [ ] Add a thin source inventory API and UI that list opaque source metadata, Seed status, CatalogAsset status, and provenance references.
- [ ] Support harvest and prime as reviewable candidate actions; require authorized human approval for cull and CatalogAsset publication after substantiate.
- [ ] Keep Seeds outside the Catalog; only human-approved substantiated material can become a CatalogAsset.
- [ ] Reuse the existing generation-source eligibility resolver rather than creating a second authority model.
- [ ] Add a focused API seam test and a browser-flow test using synthetic source metadata only.

## Acceptance Criteria

- [ ] A candidate can inspect inventory counts/statuses and initiate harvest or prime without seeing raw source content in logs or telemetry.
- [ ] A harvested Seed cannot be used for application generation until it is substantiated and human-approved for promotion.
- [ ] A human-approved cull action preserves provenance while making the material unavailable to generation.
- [ ] The canonical Obsidian vault is never written by this slice.
- [ ] `npm run check` and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-036
- `references`: docs/prd/mvp-book-of-work-to-application-loop.md, docs/career/canonical-domain-model.md
