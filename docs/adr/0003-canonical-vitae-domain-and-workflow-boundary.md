---
$schema: ../../schemas/docs/adr.schema.json
id: adr-0003-canonical-vitae-domain-and-workflow-boundary
type: adr
status: accepted
title: Use Canonical Vitae Domain Types and Workflow Definitions
decisionDate: 2026-08-05
lastUpdated: 2026-08-05
owners:
  - name: Vitae product owner
    role: decision owner
maturity: full
complexity: high
decisionScope:
  - product
  - architecture
  - data-model
  - workflow
  - documentation
affectedSystems:
  - vitae
  - obsidian-adapter
  - semantify
  - context-graph
  - templjs
  - doc-vader
  - agent-workflows
links:
  - label: MVP PRD
    href: ../prd/mvp-book-of-work-to-application-loop.md
    relationship: related
  - label: Career workflow platform PRD
    href: ../prd/career-workflow-platform-boundaries.md
    relationship: related
  - label: System boundary ADR
    href: 0001-vitae-system-boundaries.md
    relationship: related
  - label: Career graph ADR
    href: 0002-career-graph-and-provenance.md
    relationship: related
tags:
  - canonical-domain
  - workflow-boundary
  - mvp
  - adapters
llm:
  purpose: "Lock the corrected Vitae product model before MVP implementation: canonical domain types first, persistence adapters second, reusable workflow definitions separate from workflow runs, and no in-product work-item abstraction unless proven later."
  canonicalQuestions:
    - What are the canonical Vitae domain types for MVP?
    - How do Obsidian artifacts map into those types?
    - What is the difference between a workflow, workflow run, and work item?
    - Which concepts are explicitly outside MVP or outside the product model?
  readerHints:
    - Read this before modifying the MVP PRD or creating implementation backlog items.
    - Treat this ADR as the correction to earlier broad artifact/record/work-item language.
---

# ADR-0003: Use Canonical Vitae Domain Types and Workflow Definitions

## LLM Snapshot

- **Decision:** Vitae will model product data as canonical domain types, with Obsidian/files, databases, graphs, and generated files treated as adapters or projections.
- **Why now:** Earlier planning mixed persistence stores, platform backlog work, in-product work items, records, and workflows; MVP implementation needs sharper vocabulary.
- **Chosen because:** The corrected model preserves the existing Obsidian Career Knowledge language while keeping Vitae scalable beyond one filesystem-backed vault.
- **Watch for:** Any implementation that makes Obsidian syntax, a SQL table, or a work-item abstraction the product source of truth should trigger review.

## Status

Accepted.

## Context and Problem Statement

Vitae is intended to support a career workflow that starts with a broad Book of Work, distills reusable career assets, evaluates fit against roles, generates application deliverables, and tracks outcomes. The existing Obsidian Career Knowledge system already refined important concepts such as Seeds, Episodes, Technologies, Projections, Deliverables, and Applications. Earlier Vitae planning risked reinventing these concepts or overfitting the product model to persistence choices such as Obsidian versus a database.

How should Vitae define its MVP data and process model so implementation can proceed without conflating persistence, product authority, workflows, workflow runs, records, and platform backlog items?

## Decision Drivers

- Preserve the existing Obsidian-refined domain vocabulary where it is already strong.
- Avoid making Obsidian or any database the product-level authority model.
- Keep the MVP small enough to implement AFK in ordered slices.
- Distinguish reusable process definitions from executions of those definitions.
- Avoid requiring first-class records for every state change.
- Avoid introducing in-product work items unless a later use case proves they belong.
- Keep future integrations with Semantify, Context Graph, templjs, doc-vader, and bounded execution substrates possible through adapters and contracts; `agent-workflows` remains code-factory-only tooling, not a Vitae product adapter.

## Considered Options

- Model Vitae around persistence stores and decide which store is authoritative.
- Model every user activity as a work item and every state change as a record.
- Model Vitae around canonical domain types, adapter projections, and reusable workflows.

## Decision Outcome

Chosen option: **Model Vitae around canonical domain types, adapter projections, and reusable workflows**, because it captures the product domain directly while allowing Obsidian, SQL, graph stores, generated files, and external services to remain replaceable persistence or serialization adapters.

Canonical MVP vocabulary:

| Type | Meaning |
| --- | --- |
| `Profile` | Candidate/user identity, goals, constraints, preferences, and targeting criteria. |
| `BookOfWork` | Inclusive corpus of raw source material: master resumes, applications, job descriptions, notes, meeting minutes, documentation, links to repos, publications, and related sources. |
| `SourceAsset` | One addressable source unit inside the Book of Work. Obsidian notes, files, URLs, repo links, meeting notes, and publications can serialize as SourceAssets. |
| `Seed` | Harvested candidate material outside the Catalog, using the existing Obsidian Seed metadata/content model as the starting contract. |
| `Catalog` | Canonical curated inventory of reusable career assets. |
| `CatalogAsset` | Curated reusable career substance such as an episode, technology, accomplishment, capability, project, proof, or story. Use `Asset`, not `Item`. |
| `Target` | A JD, role archetype, company opportunity, or pursuit target. |
| `Requirement` | Structured condition extracted from or attached to a Target. |
| `FitAnalysis` | Evaluation between Catalog assets and Target requirements. |
| `Misalignment` | Gap, weak idea, unsupported claim, missing evidence, overfit, underfit, or development opportunity. |
| `Recommendation` | Source-backed suggestion to improve alignment or deliverables. |
| `Deliverable` | Role/application-specific output such as a resume variant, cover letter, communication, brief, or prep document. |
| `Application` | Tracked pursuit of a Target role. |
| `ApplicationRecord` | Durable material application event such as submission, interview, decision, follow-up, or important note. |
| `Portfolio` | Reusable curated presentation set assembled from source and catalog material for an audience or purpose. |
| `PortfolioAsset` | Curated proof/presentation asset such as a case study, repo page, writing sample, photo set, floor plan, publication, demo, or project page. |
| `Workflow` | Reusable process definition or pipeline. |
| `WorkflowRun` | One execution of a Workflow against concrete inputs. |
| `Projection` | Structured extraction or rendering from one representation into canonical data or deliverable output. |
| `Evidence` | Support for a claim, requirement match, catalog asset, recommendation, or application event. |
| `Relationship` | Typed edge such as `derivedFrom`, `evidences`, `targets`, `uses`, `supersedes`, `harvestedFrom`, or `maturesInto`. |
| `SourceRef` | Adapter-neutral address into source material: URI, path, block ID, span, row ID, object path, or provider-specific locator. |

## Consequences

- Good: MVP implementation can start from a stable domain language.
- Good: Obsidian remains useful as a filesystem/Markdown adapter without becoming the product model.
- Good: Existing Seeds stay outside the Catalog and can keep their refined metadata/content structure.
- Good: Workflow definitions can be durably executed through a direct Vitae-owned Temporal adapter (ADR-0004) without exposing work items as product primitives or making Temporal a domain authority.
- Good: Records are reserved for durable material events rather than every mutation.
- Bad: Existing broad backlog items need reconciliation before AFK implementation.
- Bad: Early implementations must map older Vitae resume/job/analysis models into the new vocabulary.
- Neutral: Some supporting-system boundaries remain documented contracts until an MVP slice needs them.

## Confirmation

Compliance will be checked through:

- MVP PRD requirements using the canonical terms in this ADR.
- Backlog items that create ordered implementation slices from the canonical model.
- Review of Obsidian compatibility mappings before schema or database changes.
- Validation that new docs use the canonical ADR/PRD schemas where available.
- Code review checks that avoid introducing in-product work-item abstractions without a new ADR.

## Option Details

### Model Vitae around persistence stores

Vitae would decide which data lives in Obsidian, which data lives in a database, and which store owns each field.

- Good: Easy to discuss current implementation mechanics.
- Bad: Overfits to one user's filesystem-backed setup.
- Bad: Makes large-scale rollout harder.
- Bad: Hides the product model behind adapter details.

### Model every user activity as a work item and every state change as a record

Vitae would use work items for product activities and records for all state transitions.

- Good: Strong auditability and resumability.
- Bad: Too much overhead for normal product use.
- Bad: Conflates platform backlog with user career workflows.
- Bad: Makes simple interactions feel like project management.

### Model canonical domain types and reusable workflows

Vitae defines product-domain types and uses adapters for persistence. Workflows are reusable process definitions; workflow runs execute them.

- Good: Matches the refined Obsidian vocabulary while allowing other storage backends.
- Good: Keeps MVP focused on career value instead of process infrastructure.
- Good: Leaves room for Semantify, Context Graph, templjs, doc-vader, and bounded execution adapters to plug in behind contracts. ADR-0004 selects Temporal for durable product execution; Babysitter remains code-factory tooling and `agent-workflows` is not on the product path.
- Bad: Requires explicit mapping from current code and Obsidian notes.

## Implementation Notes

- Revise existing broad PRD/backlog language before product implementation.
- Create a domain-model backlog item that maps existing Obsidian Seeds, Episodes, Technologies, Projections, Deliverables, and Applications into canonical Vitae types.
- Keep technical/platform backlog outside the Vitae product domain model.
- Reserve durable records for material milestones, decisions, evidence, submissions, feedback, outcomes, and application notes.
- Defer full Portfolio support to MVP+1 unless needed to generate or reference a deliverable.

## Open Questions

- Which exact fields from the existing Obsidian Seed model are mandatory for Vitae MVP?
- Which existing Vitae backend models can be adapted versus replaced by canonical type projections?
- Which minimal execution adapter fields are necessary after the Temporal privacy boundary is proven?

## Related Work

- `docs/prd/mvp-book-of-work-to-application-loop.md`
- `docs/prd/career-workflow-platform-boundaries.md`
- `docs/adr/0001-vitae-system-boundaries.md`
- `docs/adr/0002-career-graph-and-provenance.md`
- `docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate.md`
