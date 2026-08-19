---
id: wi-020
title: Define Canonical Vitae Domain Model and Obsidian Mapping
summary: Define MVP canonical Vitae domain types and map existing Obsidian Career Knowledge models plus current Vitae backend expectations into those types.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 5
links:
  reference:
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/wayfinder/vitae-mvp-map]]'
tags:
  - mvp
  - data-model
  - obsidian-adapter
  - canonical-domain
---

## Goal

Lock the MVP canonical domain model and compatibility mapping before persistence, graph, workflow, or UI implementation begins.

## Background

Vitae should model structured data and metadata independently of persistence. Obsidian Markdown, databases, graph stores, and generated artifacts are adapters or projections. The existing Obsidian Career Knowledge models for Seeds, Episodes, Technologies, Projections, Deliverables, and Applications should be leveraged rather than reinvented.

## Tasks

- [x] Define MVP canonical types from ADR-0003 with required and optional fields.
- [x] Map existing Obsidian Seeds, Episodes, Technologies, Projections, Deliverables, Applications, notes, meeting minutes, repository links, and publications to canonical types.
- [x] Map current Vitae backend models for resumes, jobs, analyses, feedback, and categories to canonical types or projections.
- [x] Define `SourceRef`, `Relationship`, and minimal provenance fields required for MVP.
- [x] Define the durable-record threshold for `ApplicationRecord` and related material records.
- [x] Mark Portfolio and PortfolioAsset as MVP+1 unless only referenced by a Deliverable.
- [x] Create examples or fixtures for `SourceAsset`, `Seed`, `CatalogAsset`, `Target`, `Deliverable`, and `Application`.

## Deliverables

- Canonical domain model design document or schema draft.
- Obsidian-to-Vitae mapping table.
- Current-backend-to-canonical mapping notes.
- MVP fixture examples consumable by humans and agents.

## Acceptance Criteria

- [ ] Seeds are outside the Catalog and preserve compatibility with the existing Obsidian Seed model or document explicit reconciliation decisions.
- [ ] The model uses `CatalogAsset` and avoids `CatalogItem` in new MVP contracts.
- [ ] Obsidian syntax is represented as adapter data through `SourceRef` and metadata, not product authority.
- [ ] WorkItem is not introduced as an in-product canonical type.
- [ ] The model explains when a durable record is required and when ordinary state is enough.
- [ ] Follow-up implementation items can proceed without reopening core vocabulary decisions.

## Implementation Notes

- Contract registry: [`schemas/career/manifest.json`](../schemas/career/manifest.json).
- Mapping, adapter boundary, and durable-record policy: [`docs/career/canonical-domain-model.md`](../docs/career/canonical-domain-model.md).
- Reconciled planning context: [`docs/career/planning-reconciliation.md`](../docs/career/planning-reconciliation.md).

## Relationships

- `depends_on`: none
- `references`: `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`, `docs/prd/mvp-book-of-work-to-application-loop.md`
