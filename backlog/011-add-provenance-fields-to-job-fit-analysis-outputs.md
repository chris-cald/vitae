---
id: wi-011
title: Add Provenance Fields to Job Fit Analysis Outputs
summary: Add source evidence, match method, confidence, and traceability fields to job-fit mappings and analysis outputs.
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
    - '[[../docs/adr/0002-career-graph-and-provenance]]'
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
tags:
  - provenance
  - job-fit
  - api
  - backend
---

## Goal

Make job-fit outputs traceable enough for users and agents to understand which evidence supports each requirement and why.

## Background

Vitae's product promise depends on transparent fit analysis. Current outputs should evolve toward requirement mappings that expose source evidence, match method, confidence, and explanation without leaking raw sensitive content into logs or unsafe artifacts.

## Tasks

- [ ] Review current job-fit analysis and requirement-mapping schemas.
- [ ] Define provenance fields for requirement mappings, scoring facts, and recommendation inputs.
- [ ] Add or update backend models/schemas to carry source evidence, method, confidence, and explanation.
- [ ] Update service logic to populate provenance fields where the information is available.
- [ ] Add focused tests for the output shape.

## Deliverables

- Updated job-fit schema/model contract.
- Backend implementation for initial provenance fields.
- Tests or fixtures showing traceable requirement mapping.

## Acceptance Criteria

- [ ] Requirement mappings identify source evidence or explicitly mark evidence as unavailable.
- [ ] Match method and confidence are represented in a structured field.
- [ ] Output shape avoids raw-content logging and unsafe diagnostic leakage.
- [ ] Existing consumers are preserved or migrated deliberately.

## Relationships

- `depends_on`: `wi-010`
- `references`: `docs/adr/0002-career-graph-and-provenance.md`

