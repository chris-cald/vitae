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

Capture a validated, implementation-ready MVP backlog for Vitae that turns a Book of Work into source-backed CatalogAssets, evaluates multiple concurrent Target roles, generates deliverables, tracks Applications, iterates curation, and incorporates out-of-band Book of Work changes through a privacy-safe Temporal runtime without mutating the canonical Obsidian vault or introducing in-product work items.

## Notes

- Use `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md` as the vocabulary authority.
- Use `docs/prd/mvp-book-of-work-to-application-loop.md` as the MVP product scope.
- Use structured ADR/PRD frontmatter where schemas exist.
- Use Doc-Vader-style backlog files for AFK implementation work.
- Technical platform backlog remains outside the Vitae product domain.
- `Workflow` means reusable process definition; `WorkflowRun` means execution.
- Do not require a durable record for every state change.
- Temporal durable execution is MVP-blocking for curation, refresh, waits, retries, and application automation.
- UAT must not alter canonical files or Catalog content under `~/Obsidian Vaults/loft/1 Projects/Job Search/`; use read-only mounts, snapshots, or Vitae test storage.
- Keep `Seed` outside `Catalog` and preserve compatibility with the existing Obsidian Seed model.

## Decisions so far

- [ADR-0003: Use Canonical Vitae Domain Types and Workflow Definitions](../adr/0003-canonical-vitae-domain-and-workflow-boundary.md) — Vitae uses canonical product-domain types with persistence adapters; Obsidian syntax is an adapter, and work items are not MVP product primitives.
- [PRD: MVP Book of Work to Application Loop](../prd/mvp-book-of-work-to-application-loop.md) — MVP is the BookOfWork → Seed → CatalogAsset → Target fit → Deliverable → Application loop.
- [Canonical Vitae Career Domain Model](../career/canonical-domain-model.md) — each canonical record has a schema and default templjs template; storage and runtime integrations remain adapters.
- [Canonical MVP Planning Reconciliation](../career/planning-reconciliation.md) — older planning items are explicitly reconciled against ADR-0003 and the MVP PRD.

## Frontier Tickets

### Active P0 reconciliation frontier

- [Complete P0 Reconciliation](../../backlog/047-complete-p0-reconciliation.md) — coordinating epic for source-of-truth, runtime, and Job Search application-funnel alignment.
- [Refresh P0 Source-of-Truth Docs](../../backlog/048-refresh-p0-source-of-truth-docs.md) — completed; this map is the current entrypoint for P0 work.
- [Align Runtime Execution Temporal Truth](../../backlog/049-align-runtime-execution-temporal-truth.md) — make API runtime behavior, Temporal worker behavior, and UAT evidence match.
- [Deliver Job Search Application Funnel Slice](../../backlog/050-deliver-job-search-application-funnel-slice.md) — HITL epic for the minimum application bundle workflow.
- [Add Application Bundle Record Slice](../../backlog/051-add-application-bundle-record-slice.md) — persist/read the minimum application bundle records.
- [Enforce Generation Source Eligibility](../../backlog/052-enforce-generation-source-eligibility.md) — restrict generation to validated Catalog/Projection material plus target context.
- [Generate Draft Application Bundle Artifacts](../../backlog/053-generate-draft-application-bundle-artifacts.md) — produce JD note, resume draft, manifest, source summary, unsupported claims, and next action.

### Independent governance frontier

- [Add ADR PRD Frontmatter Validation Tooling](../../backlog/018-add-adr-prd-frontmatter-validation-tooling.md) — independent SDLC-governance work that can proceed without changing the product domain.

## Completed MVP UAT Tickets

- [Reconcile Planning Docs and Backlog With Canonical MVP Scope](../../backlog/019-reconcile-planning-docs-and-backlog-with-canonical-mvp-scope.md)
- [Define Canonical Vitae Domain Model and Obsidian Mapping](../../backlog/020-define-canonical-vitae-domain-model-and-obsidian-mapping.md)
- [Preserve Seed Model Compatibility and Harvest Fixtures](../../backlog/021-preserve-seed-model-compatibility-and-harvest-fixtures.md)
- [Define Harvest Cull Prime and Substantiate Workflow Contracts](../../backlog/022-define-harvest-cull-prime-and-substantiate-workflow-contracts.md)
- [Implement Target Requirement Projection and Catalog Fit Slice](../../backlog/023-implement-target-requirement-projection-and-catalog-fit-slice.md)
- [Classify Misalignments Into Harvest Cull Prime and Substantiate Actions](../../backlog/024-classify-misalignments-into-harvest-cull-prime-and-substantiate-actions.md)
- [Generate Source-Backed Resume and Communication Deliverables](../../backlog/025-generate-source-backed-resume-and-communication-deliverables.md)
- [Track One Application With Lightweight Material Records](../../backlog/026-track-one-application-with-lightweight-material-records.md)

## Completed Temporal MVP Runtime Tickets

- [Create Isolated Temporal Worker Bootstrap and Configuration Seam](../../backlog/030-create-isolated-temporal-worker-bootstrap-and-configuration-seam.md)
- [Implement Idempotent RuntimeExecution Ledger and Safe Status API](../../backlog/031-implement-idempotent-runtimeexecution-ledger-and-safe-status-api.md)
- [Deliver Opt-In Async Job-Fit Vertical Slice](../../backlog/032-deliver-opt-in-async-job-fit-vertical-slice.md)
- [Build Human Review Signal Bridge](../../backlog/033-build-human-review-signal-bridge.md)
- [Implement Durable Harvest Runtime Slice](../../backlog/034-implement-durable-harvest-runtime-slice.md)
- [Implement Durable Cull and Prime Runtime Slice](../../backlog/035-implement-durable-cull-and-prime-runtime-slice.md)
- [Implement Substantiation and Guarded Catalog Publication](../../backlog/036-implement-substantiation-and-guarded-catalog-publication.md)
- [Implement Required Durable Runtime for Target and Catalog Fit](../../backlog/037-implement-required-durable-runtime-for-target-and-catalog-fit.md)
- [Implement Required Durable Runtime for Deliverable Generation](../../backlog/038-implement-required-durable-runtime-for-deliverable-generation.md)
- [Implement Required Scheduled Application Automation for WI-026](../../backlog/039-implement-required-scheduled-application-automation-for-wi-026.md)
- [Add UAT Evidence Capture Harness](../../backlog/041-add-uat-evidence-capture-harness.md)

## Completed MVP-Blocking Live Evidence Gate

- [Adopt Privacy-Safe Durable Temporal Execution](../../backlog/027-adopt-privacy-safe-durable-temporal-execution.md) — completed after WI-040 accepted self-hosted-first MVP/UAT evidence.
- [Complete Production Hardening and Temporal Adoption Decision](../../backlog/040-complete-production-hardening-and-temporal-adoption-decision.md) — completed for MVP/UAT; production rollout remains excluded without separate approval.

## Current State

- **Implemented:** local resume/job/job-fit analysis flow, runtime-execution ledger/status API, and Temporal worker seam.
- **UAT-evidenced:** self-hosted local Temporal MVP/UAT path, opaque history inspection, provider/browser UAT, cancellation/human-wait behavior, and canonical-vault no-write evidence.
- **Contract-only or fixture-backed:** canonical Career Knowledge/Application domain schemas, workflow templates, and demo application-loop fixture slices.
- **Planned P0 reconciliation:** API/runtime truth alignment and the Job Search application-funnel bundle slice tracked by WI-049 through WI-053.

## Not yet specified

- Portfolio and PortfolioAsset workflows beyond references from deliverables.
- Full Context Graph persistence and query layer beyond what provenance and refresh require for UAT.
- Full templjs-backed rendering implementation; canonical default templates are defined, but runtime rendering is blocking only for UAT deliverables that must be regenerated dynamically.
- Full doc-vader lifecycle governance for user-domain artifacts.

## Out of scope

- In-product technical backlog or platform work-item tracking.
- Generic project management inside Vitae.
- Durable records for every field edit, autosave, sync update, or recalculation.
- Any UAT process that writes to the canonical Obsidian vault path instead of a snapshot or Vitae test storage.
- Treating Obsidian Markdown, SQL rows, or graph nodes as the product authority model.
