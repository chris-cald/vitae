---
id: wi-015
title: Evaluate templjs Backed Resume Variant Rendering
summary: Evaluate using templjs for schema-aware resume variant, cover letter, brief, and prompt bundle rendering.
type: work-item
subtype: spike
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
  - templjs
  - rendering
  - resume-variants
  - document-generation
---

## Goal

Determine whether templjs is the right rendering and validation boundary for Vitae career artifacts.

## Background

Vitae will likely need consistent rendering for resume variants, cover letters, recruiter briefs, application packets, reports, and prompt/context bundles. templjs is designed for schema-aware structured-data transformations and may provide a better long-term boundary than bespoke rendering logic.

## Tasks

- [ ] Identify one resume variant or report output suitable for a rendering spike.
- [ ] Define the input data contract for that output.
- [ ] Sketch or implement a minimal templjs template for the output.
- [ ] Evaluate validation, authoring ergonomics, provenance hooks, and failure modes.
- [ ] Recommend adopt, defer, or reject for the first production slice.

## Deliverables

- Spike notes and optional minimal template.
- Input/output contract sketch.
- Recommendation with trade-offs and follow-up backlog items.

## Acceptance Criteria

- [ ] The spike uses a concrete Vitae career artifact, not an abstract template example.
- [ ] The evaluation covers validation, rendering, extraction/provenance potential, and user-facing output quality.
- [ ] Recommendation identifies whether templjs should be adopted for the next slice.

## Relationships

- `depends_on`: `wi-010`
- `references`: `docs/adr/0001-vitae-system-boundaries.md`

