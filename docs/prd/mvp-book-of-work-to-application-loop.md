---
$schema: ../../schemas/docs/prd.schema.json
id: prd-mvp-book-of-work-to-application-loop
type: prd
status: approved
title: MVP Book of Work to Application Loop
created: 2026-08-05
lastUpdated: 2026-08-05
owners:
  - name: Vitae product owner
    role: product owner
maturity: full
complexity: high
productArea: career-workspace
primaryUsers:
  - candidate
  - career-coach
problemRefs:
  - label: Canonical domain ADR
    href: ../adr/0003-canonical-vitae-domain-and-workflow-boundary.md
    relationship: source
relatedAdrs:
  - adr-0001-vitae-system-boundaries
  - adr-0002-career-graph-and-provenance
  - adr-0003-canonical-vitae-domain-and-workflow-boundary
backlogItems:
  - wi-019
  - wi-020
  - wi-021
  - wi-022
  - wi-023
  - wi-024
  - wi-025
  - wi-026
  - wi-027
  - wi-030
  - wi-031
  - wi-032
  - wi-033
  - wi-034
  - wi-035
  - wi-036
  - wi-037
  - wi-038
  - wi-039
  - wi-040
  - wi-047
  - wi-048
  - wi-049
  - wi-050
  - wi-051
  - wi-052
  - wi-053
successMetricIds:
  - metric-canonical-model-validated
  - metric-mvp-loop-complete
  - metric-source-backed-deliverables
links:
  - label: Wayfinder MVP map
    href: ../wayfinder/vitae-mvp-map.md
    relationship: related
  - label: Documentation standards
    href: ../documentation-standards.md
    relationship: related
tags:
  - mvp
  - book-of-work
  - catalog
  - application-loop
llm:
  purpose: "Define the smallest end-to-end Vitae product loop to implement AFK after domain-model reconciliation: profile and Book of Work ingestion, Seed harvesting, CatalogAsset distillation, fit analysis, source-backed deliverables, and application tracking."
  canonicalQuestions:
    - What is the MVP user journey?
    - Which canonical domain types are in scope?
    - What is explicitly out of scope for MVP?
    - Which backlog items implement the MVP in order?
  readerHints:
    - Use this PRD as the product scope source for MVP backlog execution.
    - Read ADR-0003 before interpreting any type names.
---

# PRD: MVP Book of Work to Application Loop

## LLM Snapshot

- **Problem:** Vitae needs a sharply scoped MVP that captures the existing Career Knowledge process without turning the product into a project tracker or persistence-specific Obsidian tool.
- **Primary user:** Candidates need help turning a messy Book of Work into substantiated career assets and role-specific applications.
- **Outcome:** The MVP guides a user from Profile and Book of Work ingestion through Catalog distillation, fit analysis, source-backed deliverables, and application tracking.
- **Scope boundary:** MVP includes canonical data modeling, multiple concurrent role/application loops, iterative curation, realtime Book of Work change incorporation, and Temporal-backed durable execution. Full portfolio management and deep external integrations remain later.
- **Success signal:** A user can create a Profile, ingest SourceAssets, harvest Seeds, promote CatalogAssets, evaluate fit for multiple Targets, generate source-backed Deliverables, track concurrent Applications, and see out-of-band Book of Work changes incorporated without mutating the canonical vault.

## Status

Approved for backlog discovery and AFK implementation planning.

## Problem Statement

The current Vitae app supports resume and job-fit analysis, while the existing Obsidian Career Knowledge process supports a richer loop: ingest a Book of Work, harvest and refine Seeds, build a validated Catalog, target roles, generate deliverables, and track applications. Without a scoped MVP, implementation can either stay too narrow as a resume optimizer or become too broad as a full career operating system. The MVP needs to capture the core loop while preserving the ability to support non-Obsidian storage at scale.

## Goals

- Define concurrent end-to-end product loops from Book of Work to tracked Applications.
- Reuse the refined Obsidian domain concepts where they are already stronger than new Vitae terminology.
- Keep persistence adapters separate from canonical data types.
- Generate deliverables only from source-backed or explicitly flagged material.
- Reserve durable records for material user-facing events rather than every state change.
- Create backlog items that an AFK agent can implement in dependency order.
- Use Temporal as the MVP durable execution substrate for curation, refresh, human waits, retries, and application automation.
- Incorporate out-of-band Book of Work changes without mutating canonical Obsidian files or Catalog content under `~/Obsidian Vaults/loft/1 Projects/Job Search/`.

## Non-Goals

- Do not implement a generic project-management or work-item system inside Vitae.
- Do not make technical platform backlog part of the Vitae product model.
- Do not require a durable record for every edit, autosave, sync update, or internal recalculation.
- Do not complete full Portfolio publishing or public portfolio management in MVP.
- Do not require full agent-workflows, doc-vader, templjs, Semantify, or Context Graph integration before the MVP loop exists.
- Do not use Temporal as a canonical domain store, audit source, or bypass around Vitae authorization.
- Do not make Obsidian Markdown syntax the product source of truth.

## Users and Use Cases

### Primary Users

- Candidate: wants to turn raw career material into credible application outputs.
- Career coach: wants to review source evidence, gaps, recommendations, and application status.

### Core Use Cases

- As a candidate, I want to ingest a Book of Work so that Vitae can find reusable career material I might not remember to use.
- As a candidate, I want harvested Seeds to remain separate from the Catalog until they are culled, primed, and substantiated.
- As a candidate, I want Vitae to compare my Catalog against a target JD or role so that I can see fit and misalignment clearly.
- As a candidate, I want deliverables generated from substantiated assets so that I do not introduce unsupported claims.
- As a candidate, I want application tracking for notes, status updates, and material outcomes so that each role pursuit stays connected to its source-backed materials.
- As a candidate, I want multiple role pursuits active at once so that each JD, fit analysis, deliverable set, and application status stays isolated.
- As a candidate, I want iterative curation so that harvested material can be culled, primed, substantiated, promoted, and reflected in updated fits and deliverables.
- As a candidate, I want Vitae to notice out-of-band Book of Work changes in near real time without editing my canonical vault files.

## Requirements

| ID | Requirement | Priority | Acceptance Signal |
| --- | --- | --- | --- |
| REQ-001 | The MVP must define canonical domain types for `Profile`, `BookOfWork`, `SourceAsset`, `Seed`, `Catalog`, `CatalogAsset`, `Target`, `Requirement`, `FitAnalysis`, `Misalignment`, `Recommendation`, `Deliverable`, `Application`, `ApplicationRecord`, `Workflow`, `WorkflowRun`, `Projection`, `Evidence`, `Relationship`, and `SourceRef`. | Must | A schema/design artifact maps each type to existing Obsidian and current Vitae expectations. |
| REQ-002 | The MVP must treat Obsidian/filesystem syntax as an adapter over structured data and metadata, not as the product model. | Must | Obsidian examples map into canonical objects through `SourceRef`/adapter fields. |
| REQ-003 | The MVP must keep `Seed` outside the `Catalog` and preserve compatibility with the existing Obsidian Seed model. | Must | Seed fixtures use the existing Seed metadata/content structure or document any reconciled differences. |
| REQ-004 | The MVP must support the process verbs `harvest`, `cull`, `prime`, and `substantiate`. | Must | Workflow definitions or service contracts include these stages and their outputs. |
| REQ-005 | The MVP must evaluate fit between a Catalog and multiple concurrent Target JDs or roles. | Must | Fit output links each Target's Requirements to CatalogAssets/Evidence or records Misalignments without cross-application bleed. |
| REQ-006 | The MVP must identify misalignments as harvest opportunities, cull candidates, prime opportunities, or substantiation gaps. | Must | Misalignment output uses these categories and can drive the next user action. |
| REQ-007 | The MVP must generate at least one resume Deliverable and one communication Deliverable from source-backed material. | Must | Generated outputs include source/provenance references or explicit human-confirmation flags. |
| REQ-008 | The MVP must track multiple concurrent Applications with notes, material status changes, and outcomes. | Must | At least two active Applications link distinct Targets, Deliverables, ApplicationRecords, and notes without cross-contamination. |
| REQ-009 | Workflow must mean reusable process definition; WorkflowRun must mean one execution of a workflow. | Must | Domain docs and backlog avoid using `work-item` as an in-product primitive. |
| REQ-010 | Records must be created only for material events, decisions, evidence, feedback, submissions, follow-ups, outcomes, or important notes. | Must | MVP docs define a record threshold and implementation avoids per-state-change record requirements. |
| REQ-011 | Portfolio and PortfolioAsset must be defined as reusable curated presentation concepts but deferred unless needed by deliverable references. | Should | MVP type registry marks Portfolio support as MVP+1 unless a fixture needs a reference. |
| REQ-012 | The MVP must support iterative curation after initial ingestion. | Must | UAT demonstrates harvest/cull/prime/substantiate actions changing CatalogAssets and dependent fit/deliverable status. |
| REQ-013 | The MVP must incorporate out-of-band Book of Work changes in near real time. | Must | A watched source change is detected and either incorporated or marks affected objects stale without manual re-upload. |
| REQ-014 | Temporal-backed durable execution is required for MVP curation, refresh, waits, retries, and application automation. | Must | Temporal worker/adapter/ledger paths pass retry, cancellation, replay, idempotency, and privacy-boundary tests. |
| REQ-015 | MVP UAT must not mutate canonical Obsidian files or Catalog content under `~/Obsidian Vaults/loft/1 Projects/Job Search/`. | Must | UAT uses read-only or snapshot input and records no create/modify/delete/rename events under that path. |

## User Experience Notes

- Onboarding should feel like guided distillation, not data entry into a tracker.
- The user should see the Book of Work as raw material, Seeds as candidates, and CatalogAssets as reusable career substance.
- Fit analysis should make evidence and gaps visible without requiring the user to inspect graph internals.
- Misalignment review should use the product verbs: harvest, cull, prime, substantiate.
- Deliverable generation should clearly distinguish supported language from material that needs human confirmation.
- Application tracking should stay lightweight: notes, status, material events, and outcomes.

## Data and Contracts

MVP input families:

- Profile data and preferences.
- Book of Work SourceAssets such as master resumes, applications, job descriptions, notes, meeting minutes, documentation, repo links, publications, and prior deliverables.
- Target JD or role data.

MVP output families:

- Seeds harvested from SourceAssets or Misalignments.
- CatalogAssets promoted from substantiated Seeds or existing validated sources.
- Requirements projected from Target.
- FitAnalysis and Misalignment records.
- Recommendations with evidence or human-confirmation flags.
- Deliverables such as resume variant and communication draft.
- Application and material ApplicationRecords.

Adapter expectations:

- Obsidian adapter maps frontmatter, Markdown content, wikilinks, headings, and paths into canonical objects and SourceRefs.
- Database adapter can persist canonical objects without requiring Markdown syntax.
- Future graph adapter can index Relationships and provenance without owning product semantics.

## Success Metrics

| ID | Metric | Target | Measurement Method |
| --- | --- | --- | --- |
| metric-canonical-model-validated | Canonical model validated against existing Obsidian and Vitae examples | At least one fixture for Seed, SourceAsset, CatalogAsset, Target, Deliverable, and Application maps cleanly | Schema/design review and fixture validation |
| metric-mvp-loop-complete | Concurrent end-to-end MVP loops complete | Profile + BookOfWork to Application tracking works for at least two active roles | Focused integration or acceptance scenario |
| metric-book-of-work-refresh-safe | Out-of-band Book of Work changes are safely incorporated | A source change updates or stales derived state without mutating the canonical vault | Watcher/Temporal UAT scenario plus no-write evidence |
| metric-source-backed-deliverables | Generated outputs preserve authenticity | Resume and communication deliverables include source references or confirmation flags | Contract test or reviewed fixture |

## Assumptions

- The existing Obsidian Career Knowledge model is valuable source material and should be reconciled, not replaced blindly.
- Candidates value trustworthy, source-backed outputs more than opaque generated text.
- Early contract tests can use fixtures, but full MVP UAT requires persisted state, Temporal execution, and read-only/snapshot Book of Work input.
- Existing resume/job analysis code can be adapted incrementally.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| MVP still becomes too broad | AFK implementation stalls | Keep slices thin: durable foundation, concurrent applications, curation loop, read-only watcher, then generation |
| Obsidian-specific details leak into product model | Large-scale rollout becomes harder | Require adapter mapping and canonical fixtures |
| Existing backend models conflict with canonical types | Implementation churn | Start with projection/design fixtures before database migrations |
| Generated deliverables include unsupported claims | User trust and privacy risk | Require source references or human-confirmation flags |
| Records become too heavy | Product feels like project management | Apply the durable-record threshold from ADR-0003 |

## Launch and Readiness

- Complete the canonical domain model and Obsidian compatibility mapping first.
- Add implementation slices only after dependencies are explicit in backlog frontmatter.
- Use focused fixtures before changing persistence, but full UAT requires persisted multi-application state.
- Treat current broad backlog items as reference until reconciled with this MVP scope.
- Run documentation/backlog validation before AFK execution starts.
- Use `GET /api/v1/mvp/application-loop/demo` as a contract smoke path only; full UAT requires Temporal-backed concurrent application, curation, and Book of Work refresh scenarios.

## Open Questions

| Question | Owner | Resolution Date |
| --- | --- | --- |
| Which existing Obsidian Seed fields are required versus optional for MVP? | Product/engineering |  |
| Which current Vitae backend model should host the first canonical projection? | Engineering |  |
| Should the first deliverable generation use existing prompt paths or a templjs-compatible contract fixture? | Product/engineering |  |

## Backlog Mapping

| Requirement ID | Backlog Item | Notes |
| --- | --- | --- |
| REQ-001 | wi-020 | Canonical domain model and Obsidian mapping |
| REQ-002 | wi-020 | Adapter boundary and examples |
| REQ-003 | wi-021 | Seed model compatibility |
| REQ-004 | wi-022 | Harvest/cull/prime/substantiate workflow contracts |
| REQ-005 | wi-023 | Target requirement and fit analysis slice |
| REQ-006 | wi-024 | Misalignment review categories |
| REQ-007 | wi-025 | Source-backed deliverable generation |
| REQ-008 | wi-026, wi-039 | Concurrent lightweight application tracking and scheduled automation |
| REQ-009 | wi-019, wi-027 | Planning reconciliation and Temporal workflow boundary |
| REQ-010 | wi-020, wi-031 | Record threshold and RuntimeExecution ledger |
| REQ-011 | wi-020 | Portfolio deferred type definition |
| REQ-012 | wi-034, wi-035, wi-036 | Durable curation runtime slices |
| REQ-013 | wi-034, wi-040 | Book of Work refresh and readiness evidence |
| REQ-014 | wi-027, wi-030, wi-031, wi-032, wi-033, wi-037, wi-038, wi-039, wi-040 | Temporal durable execution adoption |
| REQ-015 | wi-028, wi-034, wi-040 | Canonical vault no-write guardrail |

## Related Work

- `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
- `docs/adr/0001-vitae-system-boundaries.md`
- `docs/adr/0002-career-graph-and-provenance.md`
- `docs/prd/career-workflow-platform-boundaries.md`
- `docs/wayfinder/vitae-mvp-map.md`
