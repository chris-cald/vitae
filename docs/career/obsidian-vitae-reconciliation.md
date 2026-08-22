# Obsidian Career Knowledge → Vitae Domain Reconciliation

## Status

Critical-path analysis. This document reconciles the documented Career Knowledge model with Vitae before workflow and persistence implementation proceeds. It is based on a read-only review of the vault's architectural README, HOME, glossary, Seed guide, Deliverables guide, contributor protocol, structural inventory, and representative metadata shapes. No vault content or PII is copied here.

## Source model findings

| Career Knowledge concept | Documented meaning | Vitae interpretation |
| --- | --- | --- |
| Episode | Atomic unit of professional knowledge; coherent work with objective, responsibility, outcome, significance, and supporting evidence | Confirmed/substantiated `CatalogAsset` with `assetKind: episode`; never a Seed. |
| Catalog | Durable store of professional facts | Collection of confirmed `CatalogAsset` records; not a bag of provisional ideas. |
| Projection | Reusable communication derived from one or more Episodes | Downstream `Projection` derived from confirmed CatalogAssets; not Seed input except when review surfaces a separate adjacent gap. |
| Deliverable | Application-specific customization, organized into role-bundle manifests | `Deliverable` attached to an `Application`; may use Projections but must preserve source and confirmation boundaries. |
| Seed | Passive, growable, non-generative candidate | `Seed` outside Catalog, excluded from generation until promotion creates a mature artifact. |
| Work Order | Execution/coordination artifact for knowledge work | External workflow-governance adapter; not an in-product `WorkItem`. |
| Blue/Green tests | Job/application validation and gap interrogation evidence | Validation evidence and fit-analysis input; not product-domain source authority. |
| Concept / Technology pages | Organically emerging conceptual knowledge and discovery metadata | Catalog metadata/relationships, not necessarily standalone canonical assets. |

## Verified vault conventions

- The vault contains 197 Markdown records. Its primary stores are Catalog, Projections, Deliverables, Seeds, Work Orders, and Tests.
- Episodes use lightweight discovery metadata such as company, role, timeframe, competencies, domains, and technologies; narrative remains in Markdown.
- Projections are reusable communication; Deliverables are application-specific and must not be promoted back into Catalog facts.
- Role manifests (`type: deliverable-manifest`) act as application-bundle ledgers and distinguish generated, submitted, process, history, communications, career-knowledge-used, and claims-needing-validation material.
- Seeds have the fields `status`, `quality`, `incubation_mode`, `matures_to`, and `provenance`, plus explicit Justification, Roots, Growth Conditions, and Promotion Criteria sections.

## Reconciliation decisions

1. **Episode is a subtype of CatalogAsset.** Vitae must add an explicit `assetKind`/mature-form discriminator before it models workflows that promote Seeds or build fit evidence.
2. **Projection is a derived communication layer.** It needs explicit `derivedFrom` relationships to CatalogAssets/Episodes and must not be treated as independent factual evidence.
3. **Deliverable is an application-bound artifact.** It links its Application and manifest-backed bundle, source CatalogAssets/Projections, material category, and block-level provenance or human-confirmation state. A deliverable-manifest maps to an Application bundle rather than a generic document; `cover-letter` remains a separately typed contract, and generic Deliverables cannot use that type.
4. **Note is a general durable detail.** A `Note` records an observation, interaction, communication, interview, or follow-up against arbitrary canonical subjects with timestamps and privacy/retention metadata. Application records link Notes rather than embedding prose or repurposing `SourceAsset`; a harvest may later derive Evidence from a Note.
5. **Seed promotion creates only a validated CatalogAsset.** A Seed's `maturesTo` value names a possible `CatalogAsset.assetKind`; promotion requires every source-backed criterion to be satisfied. A Projection may derive only from pre-existing validated CatalogAssets and can never be a promotion target or the first substantiation of a claim.
6. **Work Orders and Tests are adapters/evidence.** Their lifecycle syntax remains outside the product authority model while preserving relevant source references and validation outcomes. Neither is generation authority.

## Material gaps to close before WI-022 through WI-026

| Gap | Required contract change | Blocks |
| --- | --- | --- |
| CatalogAsset does not distinguish Episode from other mature forms | **Closed:** `assetKind`, validated confirmation state, and Episode evidence contract | Unblocks Seed promotion and fit mapping contracts |
| Projection lacks upstream artifact references | **Closed:** required `derivedFromCatalogAssetIds` with executable validation guard | Unblocks fit explanation and deliverable authenticity contracts |
| Deliverable lacks explicit Application/bundle relationship | **Closed:** Application/bundle, source/projection IDs, material category, and block provenance contract | Unblocks source-backed generation contract |
| Application lacks manifest/material categories | **Closed:** manifest-backed bundle, categories, and linked Notes | Unblocks application tracking contract |
| Workflow schemas lack explicit input/output transition semantics | **Closed:** ordered Harvest/Cull/Prime/Substantiate Workflow stages, typed WorkflowRun inputs/outputs, safe diagnostics, and explicit Cull/publication approvals | WI-022 |

## Critical-path sequence

1. **Complete:** extend canonical schemas with the Episode, Projection, Deliverable, and Application contracts and anonymized positive/negative fixtures.
2. Define guarded Harvest → Cull → Prime → Substantiate workflow transitions against those schemas (`wi-022`).
3. Implement Target Requirement projection and Catalog fit against embedded mappings (`wi-023`).
4. Layer Misalignments, runtime source-backed Deliverables, and material Application records in that order (`wi-024`–`wi-026`).

## Open decisions

- **Decided:** a Seed may not promote directly into a Projection. A Projection may communicate only existing confirmed CatalogAssets; it can never be the first substantiation of a claim.
- **Decided:** confirmed Episodes use `CatalogAsset.assetKind: episode`; Technology, Domain, and Boundary may use an asset kind only when they independently meet the same validation and provenance threshold. Otherwise they remain relationship-backed metadata.
- **Decided:** Work Orders and Tests remain external adapter/evidence artifacts, not product WorkItems or generation authority.
