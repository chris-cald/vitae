---
id: wi-025
title: Generate Source-Backed Resume and Communication Deliverables
summary: Generate one resume variant and one communication artifact from CatalogAssets, FitAnalysis, and Misalignment Recommendations while preserving source references and confirmation flags.
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: blocked
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

- [ ] Define Deliverable input contract using Profile, CatalogAssets, Target, FitAnalysis, Misalignments, and Recommendations.
- [ ] Generate or fixture one resume variant Deliverable.
- [ ] Generate or fixture one communication Deliverable such as cover letter, outreach email, or recruiter brief.
- [ ] Include source references for supported content and human-confirmation flags for speculative or development-opportunity content.
- [ ] Define how a future templjs renderer could consume the same structured inputs.
- [ ] Add focused tests or reviewed fixtures for source-backed output.

## Deliverables

- Deliverable generation contract or implementation slice.
- Resume variant example.
- Communication artifact example.
- Source-reference and confirmation-flag examples.

## Acceptance Criteria

- [ ] Generated deliverables use CatalogAssets or explicit Recommendations as inputs.
- [ ] Each material claim is source-backed or flagged for human confirmation.
- [ ] Output does not require Portfolio support beyond optional references.
- [ ] The contract can later route through templjs without changing product semantics.

## Relationships

- `depends_on`: `wi-023`, `wi-024`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
