---
id: wi-024
title: Classify Misalignments Into Harvest Cull Prime and Substantiate Actions
summary: Classify fit-analysis gaps and weak matches into product action categories that drive the next user step without creating work items for every activity.
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: blocked
priority: high
estimated: 4
links:
  depends_on:
    - '[[023-implement-target-requirement-projection-and-catalog-fit-slice]]'
  reference:
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
tags:
  - mvp
  - misalignment
  - recommendations
  - catalog
---

## Goal

Turn FitAnalysis gaps and weak matches into clear next actions using Vitae's MVP product verbs.

## Background

The MVP should not merely score fit; it should explain how to improve alignment. Misalignments should be categorized as harvest opportunities, cull candidates, prime opportunities, or substantiation gaps. These categories guide user action without creating a product work item for every change.

## Tasks

- [ ] Define Misalignment categories and required fields.
- [ ] Classify unmatched Requirements, weak CatalogAssets, unsupported claims, and overfit material.
- [ ] Produce Recommendation candidates tied to Misalignments.
- [ ] Preserve source references and human-confirmation flags for speculative material.
- [ ] Add examples for each category: harvest, cull, prime, and substantiate.

## Deliverables

- Misalignment classification contract or implementation.
- Example output covering all four categories.
- Recommendation candidate examples linked to Requirements and CatalogAssets.

## Acceptance Criteria

- [ ] Every Misalignment has one of the MVP action categories or an explicit not-applicable reason.
- [ ] Recommendations identify source-backed versus human-confirmation-required material.
- [ ] Weak or unsupported material can be culled without deleting source history.
- [ ] Output can drive UI or agent next steps without in-product WorkItems.

## Relationships

- `depends_on`: `wi-023`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
