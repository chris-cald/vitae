---
id: wi-016
title: Define doc-vader Compatible Evidence Records for Applications
summary: Define evidence, decision, comment, validation, and application-event records for Vitae application workflows using doc-vader-compatible lifecycle concepts.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: medium
estimated: 4
links:
  depends_on:
    - '[[010-define-career-artifact-and-record-schema]]'
  reference:
    - '[[../docs/adr/0001-vitae-system-boundaries]]'
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
tags:
  - doc-vader
  - evidence
  - applications
  - lifecycle
---

## Goal

Define how Vitae should record application evidence and decisions as first-class records.

## Background

Application workflows involve submissions, follow-ups, interviews, reviewer decisions, generated artifacts, and validation events. These should not live only as mutable notes or opaque database updates. doc-vader's work-management model provides a useful pattern for evidence and decision records with lifecycle validation.

## Tasks

- [ ] Define record subtypes needed for application workflows.
- [ ] Define minimum metadata for source event, related application, related artifact, timestamp, outcome, and links.
- [ ] Map record subtypes to doc-vader-compatible evidence/comment/decision concepts.
- [ ] Create examples for application submission, reviewer decision, and validation evidence.
- [ ] Identify storage options for app database, Markdown, or dual projections.

## Deliverables

- Application evidence record contract draft.
- Example records.
- Recommended storage and validation approach.

## Acceptance Criteria

- [ ] Evidence, decision, comment, validation, and application-event records are distinguished.
- [ ] Example records link to applications and artifacts.
- [ ] The contract can support both human review and LLM/agent consumption.
- [ ] Open storage and validation questions are captured.

## Relationships

- `depends_on`: `wi-010`
- `references`: `docs/adr/0001-vitae-system-boundaries.md`

