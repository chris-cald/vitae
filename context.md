# Code Context

## Files Retrieved
1. `backlog/022-define-harvest-cull-prime-and-substantiate-workflow-contracts.md` (lines 1-58) - WI-022 scope: reusable onboarding/catalog-distillation definition, concrete run outputs, stage contracts, AFK/HITL boundary, and no in-product WorkItem.
2. `schemas/career/workflow.schema.json` (lines 1-43) - current Workflow is only `id`, `kind`, `name`, optional untyped `inputKinds`/`outputKinds`; it needs explicit stages/transition contracts.
3. `schemas/career/workflow-run.schema.json` (lines 1-47) - current run has only identity, workflow ID, status, start/end time; WI-022 requires inputs, outputs, diagnostics, and review points.
4. `schemas/career/seed.schema.json` (lines 1-74) - source-backed provisional Seed statuses already contain `culled`, `primed`, and `substantiated`; promotion evidence and allowed mature forms are guarded.
5. `schemas/career/catalog-asset.schema.json` (lines 1-54) - validated reusable output; Episode is `assetKind: episode` and requires objective/responsibility/outcome/significance evidence.
6. `schemas/career/evidence.schema.json` (lines 1-44) - Evidence requires a claim and at least one `sourceRefs` value.
7. `schemas/career/misalignment.schema.json` (lines 1-46) - output category already enumerates `harvest`, `cull`, `prime`, `substantiate` and is tied to a fit-analysis/requirement.
8. `schemas/career/recommendation.schema.json` (lines 1-46) - recommendation requires a misalignment ID and action, with optional rationale/source references.
9. `schemas/career/source-asset.schema.json` (lines 1-44) - canonical source input with mandatory `sourceRef`; source types include note, meeting-minutes, repository, publication, resume, and job-description.
10. `schemas/career/contract-guards.mjs` (lines 1-72) - executable promotion/projection/deliverable guards; a workflow guard can reuse the same persistence-neutral record-array pattern.
11. `schemas/career/manifest.json` (lines 1-178) - Workflow and WorkflowRun are already registered with templates; adding properties does not require a new type/registry entry.
12. `templates/career/workflow.md.tmpl` (lines 1-5) and `templates/career/workflow-run.md.tmpl` (lines 1-9) - minimal existing renderings; should show stage definitions and run inputs/outputs/review status after schema expansion.
13. `docs/career/canonical-domain-model.md` (lines 5-24, 74-91) - authority: Workflow is reusable definition, WorkflowRun one execution; neither is a backlog item; agent execution is a deferred adapter boundary.
14. `docs/career/seed-compatibility.md` (lines 18-48) - harvest cardinality and state disposition rules. A run selects one mature target from multi-target `maturesTo`; it must not change Seed promotion semantics.
15. `schemas/career/test/canonical-domain-contract.test.mjs` (existing contract harness) - AJV schema compile/fixture validation, template checks/renders, and guard tests are the focused WI-022 test seam.
16. `schemas/career/fixtures/valid/harvest-*.json`, `seed-ready-for-promotion.json`, and `catalog-asset.json` - anonymized source/Seed/CatalogAsset fixture conventions that new workflow/run fixtures should follow.

## Key Code
- Workflow today is declarative but under-specified: `inputKinds` and `outputKinds` are string arrays only. Define explicit ordered stage objects (verb, inputs, outputs, execution mode/review requirement) rather than introduce an engine or WorkItem record.
- WorkflowRun today has execution status only. Add canonical record IDs grouped as inputs/outputs, diagnostics as safe structured codes/messages (no raw source content), and review-point decisions/statuses. Do not add runtime execution logic.
- Existing Seed lifecycle maps naturally to the requested stages: Harvest yields source-backed Seeds (or no durable output); Cull records weak/invalid material as culled/rejected Seed state and/or Misalignment/Recommendation; Prime yields `primed` Seed plus recommendations; Substantiate yields Evidence and validated CatalogAssets only after existing promotion requirements are met.
- Existing `Misalignment.category` already uses the four verbs; do not duplicate its enum elsewhere inconsistently.
- Canonical model explicitly forbids treating Workflow/WorkflowRun as product backlog items and defers Agent Workflows integration to an adapter. Preserve this in WI-022 documentation/schema descriptions.

## Architecture
`SourceAsset` supplies addressable provenance. Harvest creates provisional `Seed` candidates, which remain outside the Catalog. Cull and Prime are assessment/refinement stages; their durable outputs can be Seed state changes and fit-oriented `Misalignment`/`Recommendation` records. Substantiate binds claims to `Evidence` and may create a validated `CatalogAsset`; only then is the asset reusable. A reusable `Workflow` declares these product-semantic stages. A concrete `WorkflowRun` references the definition and records only that execution's input/output IDs, diagnostics, and explicit human-review state. It is not an agent orchestration graph and not a WorkItem.

## Start Here
Open `backlog/022-define-harvest-cull-prime-and-substantiate-workflow-contracts.md` first. Its acceptance criteria define the minimal contract; next open `schemas/career/workflow.schema.json` and `workflow-run.schema.json` to extend existing registered types rather than create new ones.

## Likely Changes
- `schemas/career/workflow.schema.json`
- `schemas/career/workflow-run.schema.json`
- `schemas/career/contract-guards.mjs` (only for persistence-neutral transition validation)
- `schemas/career/fixtures/valid/workflow.json` and `workflow-run.json` (new, anonymized)
- invalid counterpart fixtures for illegal stage/output/review shapes (new)
- `schemas/career/test/canonical-domain-contract.test.mjs`
- `templates/career/workflow.md.tmpl`
- `templates/career/workflow-run.md.tmpl`
- `docs/career/canonical-domain-model.md` and/or a new WI-022 workflow-contract document with the stage table and AFK/HITL notes
- `docs/career/obsidian-vitae-reconciliation.md` to mark its workflow-transition gap resolved once tests pass.

## Constraints / Risks
- Do not treat a completed run as proof that a Seed is promotable: `assertCanPromoteSeed` remains the gate.
- Do not add raw source text to diagnostics, fixtures, or run outputs; use IDs, counts, safe codes, and `SourceRef` locators only.
- No backend runtime, persistence migration, Agent Workflows ownership, or in-product WorkItem belongs in WI-022.
- Current fixture inventory has no valid Workflow or WorkflowRun fixture, so add both before testing new schema requirements.
