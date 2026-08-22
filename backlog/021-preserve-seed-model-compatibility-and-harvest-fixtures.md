---
id: wi-021
title: Preserve Seed Model Compatibility and Harvest Fixtures
summary: Capture the existing Obsidian Seed structure as the MVP Seed contract and create harvest fixtures from Book of Work SourceAssets.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: completed
priority: high
estimated: 4
links:
  depends_on:
    - '[[020-define-canonical-vitae-domain-model-and-obsidian-mapping]]'
  reference:
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
tags:
  - mvp
  - seeds
  - harvesting
  - fixtures
---

## Goal

Make Seed harvesting implementable by preserving the refined Obsidian Seed model and proving how Seeds emerge from Book of Work SourceAssets.

## Background

Seeds are raw or promising candidate material outside the Catalog. They should not be modeled as CatalogAsset maturity states. The existing Obsidian Seed metadata and content structure is the starting contract for Vitae, with reconciliation only where necessary.

## Tasks

- [x] Extract or document the existing Obsidian Seed metadata and content structure.
- [x] Define the MVP Seed schema or fixture shape aligned to `wi-020`.
- [x] Create at least two Book of Work SourceAsset fixtures that harvest into Seeds.
- [x] Define allowed Seed dispositions such as parked, culled, merged, split, primed, substantiated, or promoted.
- [x] Document what evidence or metadata is required before a Seed can promote to CatalogAsset.

## Deliverables

- Seed compatibility contract or fixture set.
- Harvest fixture examples from SourceAssets to Seeds.
- Seed disposition and promotion notes.

## Acceptance Criteria

- [x] Seed examples conform to the existing Obsidian model or explicitly document accepted differences.
- [x] Seeds remain outside the Catalog in all examples.
- [x] Harvest fixtures preserve source references back to SourceAssets.
- [x] Promotion criteria are explicit enough for a later implementation slice.

## Completion notes

The reconciliation contract now requires source-backed `promotionEvidence` for every declared criterion and permits promotion only to a validated `CatalogAsset`; direct Seed-to-Projection promotion is prohibited. This completes the schema/document/fixture prerequisite only. It does not implement the WI-022 runtime workflow.

## Relationships

- `depends_on`: `wi-020`
- `references`: `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`, `docs/prd/mvp-book-of-work-to-application-loop.md`
