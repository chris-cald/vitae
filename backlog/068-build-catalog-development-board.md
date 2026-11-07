---
id: wi-068
title: Build Catalog Development Board
summary: "Deliver the Figma-aligned mock-only Catalog Development lifecycle in the frontend draft: intake, Seeds, evidence and gaps, formalized episodes, Catalog assets, and gated decisions."
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: user-authorized-dual-lifecycle-remediation
priority: critical
estimated: 5
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  reference:
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[054-add-career-inventory-and-curation-slice]]'
tags:
  - afk
  - frontend
  - ux
  - catalog
  - mock-only
  - privacy
---

# Build Catalog Development Board

Build the first executable vertical slice of the approved dual-lifecycle Vitae UX in `frontend-draft/`. Use only synthetic local mock data and the existing Figma UX as the interaction and information-architecture reference. This is a reference implementation; it must not alter production frontend behavior or call backend APIs.

## Goal

Make Catalog Development a first-class workbench that guides a candidate from incoming career material through Seeds, evidence and gaps, episode formalization, and Catalog-ready assets. Cards must reveal detail and make required decision gates comprehensible and actionable.

## Tasks

- [ ] Replace the current shallow Career knowledge view with a board that makes the Catalog Development stages visible: Consider, Seeds, Evidence & gaps, Episodes, and Catalog assets.
- [ ] Add synthetic cards with expandable details: provenance-safe source metadata, supporting evidence, unresolved gaps, related career goals or targets, and next action.
- [ ] Add mock-only transition gates that explain what information, evidence, or human review is required before an item can advance.
- [ ] Connect Catalog Development from Today, Career knowledge, Sources & evidence, Catalog, and the mock application evidence-placement flow.
- [ ] Add focused DOM tests for board navigation, card expansion, and one blocked/one allowed transition.

## Acceptance Criteria

- [ ] A user can enter Catalog Development from the workbench navigation and see the complete lifecycle as a board of cards.
- [ ] Each card can expand to show its state, safe source/evidence metadata, gaps, and next action without rendering raw resume, job, or source content.
- [ ] A gated transition explains the missing requirement or required human decision; an eligible mock item advances and updates its displayed status.
- [ ] The existing application evidence-placement view can open a relevant Catalog Development item and return to the application context.
- [ ] The draft remains mock-only: no production frontend changes, backend/API calls, real documents, or PII.
- [ ] Focused draft tests and `npm run check` pass.

## Relationships

- `parent`: WI-050
- `references`: PRD MVP Book of Work to Application Loop, WI-054
