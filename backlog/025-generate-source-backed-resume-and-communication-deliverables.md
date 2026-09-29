---
id: wi-025
title: Generate Source-Backed Resume and Communication Deliverables
summary: Generate one resume variant and one communication artifact from CatalogAssets, FitAnalysis, and Misalignment Recommendations while preserving source references and confirmation flags.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 6
links:
  depends_on:
    - '[[023-implement-target-requirement-projection-and-catalog-fit-slice]]'
    - '[[024-classify-misalignments-into-harvest-cull-prime-and-substantiate-actions]]'
  reference:
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
tags:
  - mvp
  - deliverables
  - resume
  - generation
---

## Goal

Prove that Vitae can generate application-specific deliverables from substantiated CatalogAssets and explicit Recommendations without inventing unsupported claims.

## Background

The MVP should produce at least one resume Deliverable and one communication Deliverable for a Target. Full templjs integration can wait, but the output contract should be compatible with future structured rendering and validation.

## Tasks

- [x] Define Deliverable input contract using Profile, CatalogAssets, Target, FitAnalysis, Misalignments, and Recommendations.
- [x] Generate or fixture one resume variant Deliverable.
- [x] Generate or fixture one communication Deliverable such as cover letter, outreach email, or recruiter brief.
- [x] Include source references for supported content and human-confirmation flags for speculative or development-opportunity content.
- [x] Define how a future templjs renderer could consume the same structured inputs.
- [x] Add focused tests or reviewed fixtures for source-backed output.

## Deliverables

- Deliverable generation contract or implementation slice.
- Resume variant example.
- Communication artifact example.
- Source-reference and confirmation-flag examples.

## Acceptance Criteria

- [x] Generated deliverables use CatalogAssets or explicit Recommendations as inputs.
- [x] Each material claim is source-backed or flagged for human confirmation.
- [x] Output does not require Portfolio support beyond optional references.
- [x] The contract can later route through templjs without changing product semantics.

## Completion notes

- The MVP UAT demo returns `deliverable-targeted-resume` and `cover-letter-example-staff-platform` from canonical fixtures.
- `backend/tests/test_mvp_application_loop_service.py` checks source and CatalogAsset references.

## Relationships

- `depends_on`: `wi-023`, `wi-024`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
