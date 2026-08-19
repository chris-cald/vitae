---
id: wi-012
title: Split Scoring from Recommendation Generation
summary: Separate stable fit-scoring facts from generated feedback and edit recommendations so scoring remains explainable while recommendations can iterate.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: high
estimated: 5
links:
  depends_on:
    - '[[010-define-career-artifact-and-record-schema]]'
  reference:
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
tags:
  - scoring
  - recommendations
  - backend
  - product
---

## Goal

Separate fit scoring from recommendation generation in the product and implementation model.

## Background

Scores should be stable, explainable, and testable. Recommendations can be more iterative, creative, and user-reviewed. Keeping them coupled makes it harder to validate score behavior or improve generated feedback safely.

## Tasks

- [ ] Identify current code paths where scoring facts and generated feedback are coupled.
- [ ] Define scoring outputs separately from recommendation outputs.
- [ ] Define how recommendations consume scoring facts and provenance.
- [ ] Update schemas, services, or docs to reflect the separation.
- [ ] Add tests that can validate scoring without asserting generated prose.

## Deliverables

- A documented or implemented contract split between scoring facts and recommendations.
- Updated backend service boundaries or follow-up implementation plan.
- Focused tests for stable score facts where practical.

## Acceptance Criteria

- [ ] Scoring facts can be described without generated recommendation prose.
- [ ] Recommendations consume evidence, gaps, and scoring facts as inputs.
- [ ] Tests can validate score behavior independently from model-generated text.
- [ ] Product documentation reflects the split.

## Relationships

- `depends_on`: `wi-010`
- `references`: `docs/prd/career-workflow-platform-boundaries.md`

