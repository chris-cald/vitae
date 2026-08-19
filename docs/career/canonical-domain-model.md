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
- `Relationship` links canonical IDs with an explicit relation type. `Evidence` binds a claim to one or more `SourceRef` values.
- A `Seed` is a provisional, source-backed observation and remains **outside** a `Catalog`. A `CatalogAsset` is a promoted, reusable asset backed by source references.
- `Workflow` is a reusable definition; `WorkflowRun` is one execution. Neither is a product backlog item.
- `Deliverable` is the common output contract. `cover-letter` is a separately typed deliverable rendering contract; its claims still require source references and may require human confirmation.

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
| Episode | `SourceAsset` plus one or more `Seed` or `CatalogAsset` records | Episode Markdown/frontmatter is source data, not the authoritative product type. |
| Technology | `CatalogAsset` when it is reusable, substantiated career evidence | Otherwise retain it as a tagged attribute on a source or seed. |
| Projection | `Projection` | Record the input `SourceRef`, output kind, method, and optional confidence. |
| Deliverable | `Deliverable`; use `cover-letter` for that concrete document form | Default rendering uses templjs; generated claims retain source references and confirmation state. |
| Application note | `Application` plus zero or more `ApplicationRecord` values | Keep vault links as `SourceRef` values; create records only for material events. |
| Note or meeting minutes | `SourceAsset` | Use `sourceType: note` or `meeting-minutes` and a vault URI/locator. |
| Repository link | `SourceAsset` | Use `sourceType: repository`; individual sections/commits can be locators. |
| Publication | `SourceAsset` | Use `sourceType: publication` and retain its publication URI. |
| Wiki link, path, frontmatter, tags | `SourceRef` and adapter metadata | These are transport/persistence details, never canonical authority. |

A local, read-only Career Knowledge inventory confirmed 13 `seed` records using `status`, `quality`, `incubation_mode`, `matures_to`, and `provenance`; it also confirmed `episode`, `projection`, `deliverable`, and deliverable-manifest record families. No vault content was copied. `wi-021` will turn anonymized representatives of those shapes into adapter fixtures and document field-level transformations.

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
- `CatalogItem` and `WorkItem` are not canonical MVP types.
