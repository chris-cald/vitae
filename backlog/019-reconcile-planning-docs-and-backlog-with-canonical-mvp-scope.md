---
id: wi-019
title: Reconcile Planning Docs and Backlog With Canonical MVP Scope
summary: Update existing broad planning artifacts so future AFK work follows the canonical BookOfWork-to-Application MVP scope and does not reintroduce work-item or persistence-authority drift.
type: work-item
subtype: task
lifecycle: active
status: completed
status_reason: accepted
priority: critical
estimated: 2
links:
  reference:
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/wayfinder/vitae-mvp-map]]'
tags:
  - mvp
  - documentation
  - planning
  - canonical-domain
---

## Goal

Make the existing Vitae planning documents and broad backlog safe for AFK implementation by aligning them with the canonical MVP vocabulary and scope.

## Background

Earlier planning created useful PRDs, ADRs, and backlog items, but later decisions narrowed the model: Seeds are outside the Catalog, `Asset` is preferred over `Item`, Obsidian is an adapter, WorkItems are not an in-product MVP primitive, Workflows are reusable definitions, and durable Records are reserved for material events. Existing broad items should be reconciled before implementation agents treat them as executable truth.

## Tasks

- [x] Review `docs/prd/career-workflow-platform-boundaries.md`, `docs/adr/0001-vitae-system-boundaries.md`, and `docs/adr/0002-career-graph-and-provenance.md` for terms superseded or narrowed by ADR-0003.
- [x] Add concise supersession or scope notes where needed, linking ADR-0003 and the MVP PRD.
- [x] Review backlog items `wi-010` through `wi-018` and mark which remain valid, need rewrite, should be deferred, or are superseded by `wi-020` through `wi-026`.
- [x] Ensure any updated planning docs preserve schema-valid frontmatter.
- [x] Update the Wayfinder map if frontier or blocked item order changes.

## Deliverables

- Updated planning docs or explicit notes showing how earlier artifacts relate to ADR-0003.
- Backlog reconciliation notes for `wi-010` through `wi-018`.
- Updated Wayfinder map if needed.

## Acceptance Criteria

- [x] Future AFK agents can identify ADR-0003 and the MVP PRD as the canonical scope sources.
- [x] Broad or stale backlog items no longer conflict silently with the MVP backlog sequence.
- [x] No document claims that in-product WorkItems are an MVP primitive.
- [x] No document claims Obsidian or SQL persistence is the product authority model.
- [x] `git diff --check` passes.
- [x] `dv backlog validate --dir backlog --fail-on error` passes.

## Implementation Notes

- Reconciliation decisions: [`docs/career/planning-reconciliation.md`](../docs/career/planning-reconciliation.md).
- Canonical model introduced by the paired work item: [`docs/career/canonical-domain-model.md`](../docs/career/canonical-domain-model.md).

## Relationships

- `depends_on`: none
- `references`: `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`, `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/wayfinder/vitae-mvp-map.md`
