---
id: wi-023
title: Implement Target Requirement Projection and Catalog Fit Slice
summary: Implement or prototype the smallest target-role fit slice by projecting Requirements from one Target and matching them against CatalogAssets with evidence and provenance.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
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

- [x] Select or create one Target fixture and one Catalog fixture from `wi-020` outputs.
- [x] Define Target-to-Requirement projection behavior and diagnostics.
- [x] Match Requirements to CatalogAssets and Evidence using a simple, explainable method.
- [x] Emit FitAnalysis output with requirement IDs, matched asset/evidence references, confidence or match method, and gaps.
- [x] Keep embeddings as optional signal data, not the sole semantic authority.
- [x] Add focused validation or fixture tests where practical.

## Deliverables

- Target Requirement projection contract or implementation.
- FitAnalysis fixture or implementation slice.
- Focused validation demonstrating at least one matched and one unmatched Requirement.

## Acceptance Criteria

- [x] One Target produces structured Requirements.
- [x] At least one Requirement links to a CatalogAsset or Evidence reference.
- [x] At least one Requirement produces a gap or Misalignment candidate.
- [x] Output includes source/provenance references where available.
- [x] The implementation does not require full Context Graph persistence.

## Completion notes

- `backend/src/services/mvp_application_loop_service.py` and `GET /api/v1/mvp/application-loop/demo` provide the minimal UAT slice.
- `backend/tests/test_mvp_application_loop_service.py` validates Target, Requirement, FitAnalysis, provenance, and gap output.

## Relationships

- `depends_on`: `wi-020`, `wi-022`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0002-career-graph-and-provenance.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
