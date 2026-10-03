---
id: wi-051
title: Add Application Bundle Record Slice
summary: Persist and expose the minimum canonical Application, ApplicationRecord, Target, FitAnalysis, and Deliverable references needed for one draft application bundle.
assignee: pi-babysitter
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: implemented
priority: critical
estimated: 3
actual: 3
completed_date: '2026-10-03'
commits:
  f39294e41a29b69a154f53718870391cea2f51d4: Add application bundle record slice
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
  evidence:
    - '[[record-wi-051-focused-validation-and-independent-review-passed-after-remediation]]'
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

- [x] Add a backend service that creates a draft application bundle from an existing job/job-fit context.
- [x] Store stable bundle/application IDs and material ApplicationRecord entries only for meaningful events.
- [x] Link target, fit analysis, deliverable IDs, source refs, and unsupported-claim notes without embedding sensitive note prose in the Application record.
- [x] Expose minimal API endpoints to create/fetch a draft application bundle.
- [x] Add focused tests using synthetic data only.

## Deliverables

- Backend service/API for draft application bundles.
- Minimal persistence or storage adapter for bundle metadata.
- Focused tests for creation, fetch, and material-record threshold.

## Acceptance Criteria

- [x] Creating a draft bundle does not create records for field edits, autosaves, rescoring, or internal steps.
- [x] Application bundle data validates against the canonical schema shape or an explicitly documented adapter subset.
- [x] Tests prove at least two application bundles do not cross-contaminate targets/deliverables.
- [x] Raw resume/JD text is not logged or stored in runtime telemetry.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-048
- `references`: schemas/career/application.schema.json, schemas/career/application-record.schema.json, schemas/career/deliverable.schema.json
