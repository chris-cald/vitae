---
id: wi-013
title: Prototype Career Graph Projection for Bullets and Requirements
summary: Prototype a provenance-preserving graph slice connecting resume bullets, job requirements, evidence nodes, match edges, and score inputs.
type: work-item
subtype: spike
lifecycle: active
status: ready
status_reason: auto
priority: high
estimated: 6
links:
  depends_on:
    - '[[011-add-provenance-fields-to-job-fit-analysis-outputs]]'
  reference:
    - '[[../docs/adr/0002-career-graph-and-provenance]]'
tags:
  - career-graph
  - provenance
  - semantify
  - context-graph
---

## Goal

Prove the smallest useful career graph slice for traceable fit analysis.

## Background

The career graph direction should start with a narrow, high-value slice: resume bullets to job requirements. This slice can prove stable IDs, source provenance, match edges, confidence, and query usefulness before expanding to applications, contacts, generated artifacts, and lifecycle records.

## Tasks

- [ ] Define graph node candidates for resume, resume bullet, job, job requirement, evidence, and analysis.
- [ ] Define edge candidates such as `contains`, `evidences`, `matches`, and `derivedFrom`.
- [ ] Create a small fixture from one resume/job pair.
- [ ] Generate a deterministic graph representation from the fixture.
- [ ] Document what Semantify, Context Graph, and Vitae would each own in the prototype.
- [ ] Capture open questions and next implementation slices.

## Deliverables

- Prototype graph fixture or design artifact.
- Deterministic example output.
- Follow-up recommendations for persistent storage, API output, or UI use.

## Acceptance Criteria

- [ ] The prototype links at least one resume bullet to one job requirement.
- [ ] Nodes and edges carry source/projection/confidence metadata where available.
- [ ] Output ordering is deterministic.
- [ ] The prototype identifies what should be generalized before production use.

## Relationships

- `depends_on`: `wi-011`
- `references`: `docs/adr/0002-career-graph-and-provenance.md`

