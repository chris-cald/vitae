---
id: wayfinder-vitae-mvp-map
type: wayfinder-map
status: active
title: Vitae MVP Discovery Map
created: 2026-08-05
lastUpdated: 2026-08-05
links:
  prd: ../prd/mvp-book-of-work-to-application-loop.md
  adr: ../adr/0003-canonical-vitae-domain-and-workflow-boundary.md
---

# Wayfinder Map: Vitae MVP Discovery

## Destination

Capture a validated, implementation-ready MVP backlog for Vitae that turns a Book of Work into source-backed CatalogAssets, evaluates one Target role, generates deliverables, and tracks one Application without overfitting to Obsidian or introducing in-product work items.

## Notes

- Use `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md` as the vocabulary authority.
- Use `docs/prd/mvp-book-of-work-to-application-loop.md` as the MVP product scope.
- Use structured ADR/PRD frontmatter where schemas exist.
- Use Doc-Vader-style backlog files for AFK implementation work.
- Technical platform backlog remains outside the Vitae product domain.
- `Workflow` means reusable process definition; `WorkflowRun` means execution.
- Do not require a durable record for every state change.
- Keep `Seed` outside `Catalog` and preserve compatibility with the existing Obsidian Seed model.

## Decisions so far

- [ADR-0003: Use Canonical Vitae Domain Types and Workflow Definitions](../adr/0003-canonical-vitae-domain-and-workflow-boundary.md) — Vitae uses canonical product-domain types with persistence adapters; Obsidian syntax is an adapter, and work items are not MVP product primitives.
- [PRD: MVP Book of Work to Application Loop](../prd/mvp-book-of-work-to-application-loop.md) — MVP is the BookOfWork → Seed → CatalogAsset → Target fit → Deliverable → Application loop.
- [Canonical Vitae Career Domain Model](../career/canonical-domain-model.md) — each canonical record has a schema and default templjs template; storage and runtime integrations remain adapters.
- [Canonical MVP Planning Reconciliation](../career/planning-reconciliation.md) — older planning items are explicitly reconciled against ADR-0003 and the MVP PRD.

## Frontier Tickets

- [Preserve Seed Model Compatibility and Harvest Fixtures](../../backlog/021-preserve-seed-model-compatibility-and-harvest-fixtures.md) — reconcile actual Obsidian Seed examples with the canonical Seed contract.
- [Add ADR PRD Frontmatter Validation Tooling](../../backlog/018-add-adr-prd-frontmatter-validation-tooling.md) — independent SDLC-governance work that can proceed without changing the product domain.

## Blocked Tickets

- [Define Harvest Cull Prime and Substantiate Workflow Contracts](../../backlog/022-define-harvest-cull-prime-and-substantiate-workflow-contracts.md) — blocked by Seed compatibility.
- [Implement Target Requirement Projection and Catalog Fit Slice](../../backlog/023-implement-target-requirement-projection-and-catalog-fit-slice.md) — blocked by canonical model mapping and workflow contracts.
- [Classify Misalignments Into Harvest Cull Prime and Substantiate Actions](../../backlog/024-classify-misalignments-into-harvest-cull-prime-and-substantiate-actions.md) — blocked by fit slice.
- [Generate Source-Backed Resume and Communication Deliverables](../../backlog/025-generate-source-backed-resume-and-communication-deliverables.md) — blocked by fit slice and misalignment categories.
- [Track One Application With Lightweight Material Records](../../backlog/026-track-one-application-with-lightweight-material-records.md) — blocked by deliverables.

## Not yet specified

- MVP+1 background refresh when the Book of Work changes.
- Portfolio and PortfolioAsset workflows beyond references from deliverables.
- Full Context Graph persistence and query layer.
- Full templjs-backed rendering implementation; canonical default templates are defined, but the Vitae runtime does not yet render them.
- Full agent-workflows integration for WorkflowRun execution.
- Full doc-vader lifecycle governance for user-domain artifacts.

## Out of scope

- In-product technical backlog or platform work-item tracking.
- Generic project management inside Vitae.
- Durable records for every field edit, autosave, sync update, or recalculation.
- Treating Obsidian Markdown, SQL rows, or graph nodes as the product authority model.
