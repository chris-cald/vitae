---
id: wi-010
title: Define Career Artifact and Record Schema
summary: Define the first schema-backed model for career artifacts, records, events, evidence, decisions, and generated outputs.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: high
estimated: 4
links:
  reference:
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
    - '[[../docs/adr/0001-vitae-system-boundaries]]'
    - '[[../docs/adr/0002-career-graph-and-provenance]]'
tags:
  - schema
  - career-artifact
  - records
  - data-model
---

## Goal

Create the first canonical schema direction for Vitae career artifacts and records.

## Background

Vitae currently centers on resumes, jobs, and fit analyses. The target product direction needs a durable way to represent career-domain artifacts and supporting records such as application events, generated artifacts, evidence, decisions, comments, validation records, and submission history.

## Tasks

- [ ] Define the minimum entity vocabulary for career artifacts and records.
- [ ] Separate stable career artifact shape from mutable workflow/lifecycle state.
- [ ] Specify required fields for identity, type, source, status, ownership, links, and timestamps.
- [ ] Specify record subtypes for evidence, decision, comment, application event, validation, and generated artifact.
- [ ] Add initial examples for at least one resume variant, application event, and evidence record.
- [ ] Document how this schema relates to doc-vader lifecycle/evidence concepts.

## Deliverables

- Schema draft or design document for career artifacts and records.
- Example valid records for core use cases.
- Notes on integration points with existing backend models and future doc-vader-style validation.

## Acceptance Criteria

- [ ] Career artifact and record types are named and defined.
- [ ] Required and optional fields are separated.
- [ ] Evidence and decision records are first-class rather than inline notes.
- [ ] Examples can be consumed by humans and LLM agents without hidden context.
- [ ] Follow-up implementation work can be created without reopening vocabulary decisions.

## Relationships

- `depends_on`: none
- `references`: `docs/prd/career-workflow-platform-boundaries.md`, `docs/adr/0001-vitae-system-boundaries.md`, `docs/adr/0002-career-graph-and-provenance.md`

