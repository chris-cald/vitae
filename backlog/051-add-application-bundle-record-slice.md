---
id: wi-051
title: Add Application Bundle Record Slice
summary: Persist and expose the minimum canonical Application, ApplicationRecord, Target, FitAnalysis, and Deliverable references needed for one draft application bundle.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 3
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[048-refresh-p0-source-of-truth-docs]]'
  reference:
    - '[[../schemas/career/application.schema.json]]'
    - '[[../schemas/career/application-record.schema.json]]'
    - '[[../schemas/career/deliverable.schema.json]]'
    - '[[../schemas/career/target.schema.json]]'
    - '[[../schemas/career/fit-analysis.schema.json]]'
tags:
  - afk
  - p0
  - application
  - bundle
  - api
  - schema
---

## Goal

Create the smallest persisted/readable application-bundle slice without replacing the existing resume/job/job-fit tables.

## Background

Canonical schemas already define `Application`, `ApplicationRecord`, `Target`, `FitAnalysis`, and `Deliverable`. Existing backend models map partially to them but do not expose an application-bundle product concept.

## Tasks

- [ ] Add a backend service that creates a draft application bundle from an existing job/job-fit context.
- [ ] Store stable bundle/application IDs and material ApplicationRecord entries only for meaningful events.
- [ ] Link target, fit analysis, deliverable IDs, source refs, and unsupported-claim notes without embedding sensitive note prose in the Application record.
- [ ] Expose minimal API endpoints to create/fetch a draft application bundle.
- [ ] Add focused tests using synthetic data only.

## Deliverables

- Backend service/API for draft application bundles.
- Minimal persistence or storage adapter for bundle metadata.
- Focused tests for creation, fetch, and material-record threshold.

## Acceptance Criteria

- [ ] Creating a draft bundle does not create records for field edits, autosaves, rescoring, or internal steps.
- [ ] Application bundle data validates against the canonical schema shape or an explicitly documented adapter subset.
- [ ] Tests prove at least two application bundles do not cross-contaminate targets/deliverables.
- [ ] Raw resume/JD text is not logged or stored in runtime telemetry.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-048
- `references`: schemas/career/application.schema.json, schemas/career/application-record.schema.json, schemas/career/deliverable.schema.json
