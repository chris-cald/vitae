# Canonical Vitae Career Domain Model

## Purpose and authority

This document is the executable companion to [ADR-0003](../adr/0003-canonical-vitae-domain-and-workflow-boundary.md) and the [Book of Work to Application MVP PRD](../prd/mvp-book-of-work-to-application-loop.md). It defines persistence-neutral records for the MVP loop:

```text
Profile + BookOfWork → SourceAsset → Seed → CatalogAsset → Target fit
→ Deliverable → Application → material ApplicationRecord
```

The JSON Schema registry at [`schemas/career/manifest.json`](../../schemas/career/manifest.json) is authoritative for record shape. Each registered type has its own schema and default templjs Markdown template. These contracts are not database migrations, Obsidian frontmatter rules, graph storage models, or an in-product WorkItem model.

## Contract rules

- Every durable entity uses a stable canonical `id` and a fixed `kind`; adapter IDs belong outside the canonical record.
- `SourceRef` is the minimum source-addressing primitive. It records an adapter-resolvable `uri`, with optional `locator` and content digest. It does not embed raw source text.
- `Relationship` links canonical IDs with an explicit relation type. `Evidence` binds a claim to one or more `SourceRef` values. A `Note` captures a durable discovered detail about one or more canonical subjects; it has privacy and retention metadata but has no evidence or generation authority.
- A `Seed` is a provisional, source-backed observation and remains **outside** a `Catalog`. It is never generation-eligible. A `CatalogAsset` is a validated, reusable asset backed by source references; an Episode is specifically a `CatalogAsset` with `assetKind: episode` and structured objective, responsibility, outcome, and significance evidence.
- A `Projection` is downstream communication derived from one or more validated `CatalogAsset` records. It may not be the first factual evidence for a claim and is not a Seed promotion target.
- `Workflow` is a reusable definition; `WorkflowRun` is one execution. Neither is a product backlog item.
- `Deliverable` is an Application-bundle output contract. Each structured content block must cite canonical asset/projection IDs or source references, or set `needsHumanConfirmation: true`; templates render that block-level support. `cover-letter` is the separately typed communication-deliverable contract, not a generic Deliverable subtype.
- `Application` references a manifest-backed bundle and material categories. Potentially sensitive notes stay in linked `Note` records, rather than embedded prose.

## Registry and rendering

`schemas/career/manifest.json` registers the schemas and `templates/career/*.md.tmpl` default renderings. The templates use templjs syntax and accept the corresponding canonical record as input:

```sh
node /path/to/templjs-cli.js render \
  --template templates/career/source-asset.md.tmpl \
  --input schemas/career/fixtures/valid/source-asset.json
```

The current validation harness verifies all registered schemas compile, every template has balanced templjs delimiters, and the six core-loop fixtures validate and render. Set `TEMPLJS_CLI=/path/to/templjs-cli.js` when running the harness to additionally parse and render through a built templjs CLI. Rendering integration, storage integration, and generated-document policy remain follow-up work.

## Obsidian adapter mapping

| Existing Career Knowledge artifact | Canonical mapping | Adapter rule |
| --- | --- | --- |
| Seed note | `Seed` | Preserve its statement and provenance; do not place it in a `Catalog` merely because it has a vault location. |
| Episode | Validated `CatalogAsset` with `assetKind: episode` | Episode Markdown/frontmatter is adapter source data. The canonical asset requires structured episode evidence and source references before it is reusable. |
| Technology | `CatalogAsset` with `assetKind: technology` only when reusable and validated | Otherwise retain it as a tagged attribute on a source or Seed. |
| Projection | `Projection` | Record the rendering input, output kind, method, and required `derivedFromCatalogAssetIds`; it communicates confirmed assets rather than substantiating a claim. |
| Deliverable manifest | `Application.bundle` | Preserve the manifest as a `manifestSourceRef`, bundle ID, and material categories; it is not a separate canonical product record. |
| Deliverable | `Deliverable`; use `cover-letter` for that concrete document form | Default rendering uses templjs. Generic Deliverables cannot use the `cover-letter` type; every content block renders source/ID support or a human-confirmation state. |
| Application note | Linked `Note` referenced by `Application.noteIds` | Keep potentially sensitive note prose out of the Application record; create `ApplicationRecord` values only for material events. |
| Note, meeting minutes, or application interaction detail | `Note` | Capture the durable detail with arbitrary subject references, timestamps, privacy, and retention metadata. It may link a source, but is not evidence until a harvest creates a separate `Evidence` record. |
| Repository link | `SourceAsset` | Use `sourceType: repository`; individual sections/commits can be locators. |
| Publication | `SourceAsset` | Use `sourceType: publication` and retain its publication URI. |
| Wiki link, path, frontmatter, tags | `SourceRef` and adapter metadata | These are transport/persistence details, never canonical authority. |

A local, read-only Career Knowledge inventory confirmed 13 `seed` records using `status`, `quality`, `incubation_mode`, `matures_to`, and `provenance`; it also confirmed `episode`, `projection`, `deliverable`, and deliverable-manifest record families. No vault content was copied. Anonymized structural fixtures document the supported transformations.

## Current Vitae backend mapping

| Current model or output | Canonical mapping | Notes |
| --- | --- | --- |
| `RawResume` | `SourceAsset` | The uploaded/raw representation is a source, including its safe locator and metadata. |
| `Resume` | `Profile` projection plus future `Seed`/`CatalogAsset` extraction | Resume work, projects, skills, and publications are not automatically canonical assets until source-backed extraction occurs. |
| `RawJob` / `Job` | `SourceAsset`, `Target`, and `Requirement` projection | A job source may yield one target and many requirements. |
| `JobFit` | `FitAnalysis` | Score, target/profile references, and requirement mappings map here; calculation remains a projection concern. |
| `JobRequirementMapping` | `Requirement` mapping evidence and later `Relationship`/`Evidence` | Existing free-text evidence is not assumed to have precise locators. |
| `FeedbackItem` | `Recommendation`, optionally linked to a `Misalignment` | Keep scoring separate from recommendation text. |
| Profile categories | `Profile` preferences/projection metadata | Categories are inputs or projections, not a separate authority model. |

## Catalog-distillation workflow contract

`Workflow` defines the reusable, ordered catalog-distillation contract; `WorkflowRun` records one execution against canonical input and output IDs. They are product-semantic records, not Work Orders, backlog items, agent orchestration graphs, database jobs, or a runtime implementation.

| Stage | Inputs | Durable outputs | AFK/HITL boundary |
| --- | --- | --- | --- |
| Harvest | `SourceAsset` and optionally `Note` | source-backed `Seed`; candidate `Evidence`; safe diagnostics | May run AFK. It never promotes a Seed, publishes a CatalogAsset, or generates a Deliverable. |
| Cull | `Seed`, candidate `Evidence` | updated Seed disposition; `Misalignment`; `Recommendation` | May assess AFK. A `discard`, `merge`, or `split` disposition requires an explicit approved human review decision. |
| Prime | `Seed`, `Misalignment` | non-final primed `Seed`; `Misalignment`; `Recommendation` | May run AFK. It cannot publish a CatalogAsset. |
| Substantiate | `Seed`, candidate `Evidence` | `Evidence`; validated `CatalogAsset` | May prepare candidate catalog-asset material AFK, but it is not a durable CatalogAsset output. A validated CatalogAsset output requires an approved `publish-catalog-asset` decision, and the existing Seed promotion guard still verifies all promotion criteria and source-backed evidence. |

A WorkflowRun stores its workflow reference, lifecycle status, typed input/output ID groups, stage states, safe count/code diagnostics, and the Cull/Substantiate review decisions. Diagnostics intentionally contain identifiers, codes, severities, and counts—not raw source documents or model responses. A completed run is not itself proof that a Seed may promote.

## Promotion, projection, and generation eligibility

A Seed may promote only to a validated `CatalogAsset`. The Seed must be `substantiated`, every declared `promotionCriteria` entry must have a corresponding source-backed `promotionEvidence` entry, and the promoted asset kind must be one of its declared `maturesTo` forms. A promotion does not make the Seed itself reusable.

A Projection requires one or more referenced validated CatalogAssets. A deliverable must belong to an Application bundle and every rendered content block must be backed by canonical IDs or `SourceRef` values, unless the block explicitly requires human confirmation. The backend generation-input resolver emits only IDs, source refs, roles, and gap reasons: validated `CatalogAsset` records may provide facts, Projections backed by validated CatalogAssets may provide wording, and the current Target/JD may provide targeting context only. Seeds, Tests, Work Orders, Notes, Evidence notes, drafts, and job-fit mappings are gap-analysis material, not generation authority. The schema fixtures and `schemas/career/contract-guards.mjs` make these rules executable for adapter implementations; they do not yet constitute a full backend generation service.

## Provenance and durable-record threshold

The MVP requires enough provenance to answer “what source supports this claim?” without retaining raw documents in logs. `SourceRef.uri` is required wherever the schema requires source backing; `locator`, digest, method, and confidence are optional until an adapter can supply them.

Create an `ApplicationRecord` only for a material user-facing event:

- submitting an application;
- a scheduled or completed interview;
- an offer, rejection, withdrawal, or other decision;
- a substantive follow-up or communication; or
- a material delivered artifact/version a user must be able to audit.

Do **not** create a durable record for field edits, autosaves, refreshes, re-projections, rescoring, or agent internal steps. Those are ordinary state or workflow-run telemetry.

## Explicit MVP boundaries

- `Portfolio` and `PortfolioAsset` are MVP+1, except that a deliverable may reference an existing portfolio source through `SourceRef`.
- The registry provides templjs-compatible default templates; it does not integrate templjs into the application runtime.
- Context Graph, Semantify, Doc-Vader lifecycle governance for user-domain records, and Agent Workflows execution remain adapters/follow-up integrations.
- Work Orders and Tests remain external governance/evidence artifacts. They are not canonical product WorkItems and cannot grant generation authority.
- `CatalogItem` and `WorkItem` are not canonical MVP types.
