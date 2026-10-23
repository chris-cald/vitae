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
  - afk
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
- [ ] Support harvest, prime, cull, and CatalogAsset publication as reviewable candidate actions; the implementation records an approval request and decision without executing live source changes.
- [ ] Keep Seeds outside the Catalog; synthetic CatalogAsset promotion requires source-backed evidence for every promotion criterion, an `assetKind` declared in the Seed's `maturesTo`, and an approved `publish-catalog-asset` decision. Reserve live cull and publication for WI-057 UAT under explicit human authority.
- [ ] Reuse the existing generation-source eligibility resolver rather than creating a second authority model.
- [ ] Add a focused API seam test and a browser-flow test using synthetic source metadata only.

## Acceptance Criteria

- [ ] A candidate can inspect inventory counts/statuses and initiate harvest or prime without seeing raw source content in logs or telemetry.
- [ ] A harvested Seed cannot be used for application generation until it is substantiated and human-approved for promotion.
- [ ] Synthetic approved cull and publication actions preserve provenance and enforce generation eligibility without changing a live source.
- [ ] The canonical Obsidian vault is never written by this slice; live cull and publication are exercised only in WI-057 with explicit human authority.
- [ ] `npm run check` and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-036
- `references`: docs/prd/mvp-book-of-work-to-application-loop.md, docs/career/canonical-domain-model.md, WI-057
