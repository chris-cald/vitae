---
id: wi-023
title: Implement Target Requirement Projection and Catalog Fit Slice
summary: Implement or prototype the smallest target-role fit slice by projecting Requirements from one Target and matching them against CatalogAssets with evidence and provenance.
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: blocked
priority: high
estimated: 6
links:
  depends_on:
    - '[[020-define-canonical-vitae-domain-model-and-obsidian-mapping]]'
    - '[[022-define-harvest-cull-prime-and-substantiate-workflow-contracts]]'
  reference:
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/adr/0002-career-graph-and-provenance]]'
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
tags:
  - mvp
  - fit-analysis
  - requirements
  - catalog
---

## Goal

Create the smallest useful fit-analysis slice between one Target JD or role and the canonical Catalog.

## Background

Vitae's MVP depends on evaluating fit between a structured Catalog and a Target. The first slice should project Requirements from one Target and match those Requirements to CatalogAssets and Evidence without requiring full graph persistence or broad scoring migration.

## Tasks

- [ ] Select or create one Target fixture and one Catalog fixture from `wi-020` outputs.
- [ ] Define Target-to-Requirement projection behavior and diagnostics.
- [ ] Match Requirements to CatalogAssets and Evidence using a simple, explainable method.
- [ ] Emit FitAnalysis output with requirement IDs, matched asset/evidence references, confidence or match method, and gaps.
- [ ] Keep embeddings as optional signal data, not the sole semantic authority.
- [ ] Add focused validation or fixture tests where practical.

## Deliverables

- Target Requirement projection contract or implementation.
- FitAnalysis fixture or implementation slice.
- Focused validation demonstrating at least one matched and one unmatched Requirement.

## Acceptance Criteria

- [ ] One Target produces structured Requirements.
- [ ] At least one Requirement links to a CatalogAsset or Evidence reference.
- [ ] At least one Requirement produces a gap or Misalignment candidate.
- [ ] Output includes source/provenance references where available.
- [ ] The implementation does not require full Context Graph persistence.

## Relationships

- `depends_on`: `wi-020`, `wi-022`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0002-career-graph-and-provenance.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
