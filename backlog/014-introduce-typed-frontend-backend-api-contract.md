---
id: wi-014
title: Introduce Typed Frontend Backend API Contract
summary: Replace loose frontend API payloads with typed request and response contracts aligned with current FastAPI routes and backend schemas.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: medium
estimated: 4
links:
  reference:
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
tags:
  - api
  - frontend
  - backend
  - types
---

## Goal

Make frontend/backend API assumptions explicit and typed.

## Background

Vitae's frontend currently calls backend endpoints directly in several places, and some payloads are loosely typed. As provenance and scoring contracts mature, API drift will become more expensive unless request and response shapes are centralized and validated.

## Tasks

- [ ] Review current FastAPI routes and frontend API calls.
- [ ] Define typed request and response shapes for core resume, job, job-fit, mapping, feedback, and profile-category endpoints.
- [ ] Replace `any` payloads in the frontend API helper with explicit types.
- [ ] Decide whether generated OpenAPI types are needed now or should remain a follow-up.
- [ ] Add focused frontend or type-check validation.

## Deliverables

- Typed frontend API contract.
- Updated API helper usage for affected flows.
- Notes on OpenAPI generation or deferral.

## Acceptance Criteria

- [ ] Frontend job-fit submission no longer uses an unconstrained `any` payload.
- [ ] Core API response shapes are named and reusable.
- [ ] Type checking catches mismatched endpoint assumptions.
- [ ] Current frontend build or focused type validation passes.

## Relationships

- `depends_on`: none
- `references`: `docs/prd/career-workflow-platform-boundaries.md`

