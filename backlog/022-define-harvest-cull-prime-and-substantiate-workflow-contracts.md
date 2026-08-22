---
id: wi-022
title: Define Harvest Cull Prime and Substantiate Workflow Contracts
summary: Define MVP Workflow definitions and WorkflowRun outputs for the harvest, cull, prime, and substantiate process without introducing in-product work items.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: completed
priority: high
estimated: 4
links:
  depends_on:
    - '[[021-preserve-seed-model-compatibility-and-harvest-fixtures]]'
  reference:
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
tags:
  - mvp
  - workflow
  - catalog
  - process
---

## Goal

Define the MVP catalog-distillation process as reusable Workflow definitions and concrete WorkflowRun outputs.

## Background

The Episode/CatalogAsset, Seed promotion, Projection derivation, Deliverable provenance, and Application bundle prerequisites are now defined and fixture-validated. This item remains the next planning/implementation slice: no runtime workflow has been implemented by that prerequisite work.

The product verbs `harvest`, `cull`, `prime`, and `substantiate` are central to Vitae. They should be process stages, not project-management work items. A Workflow is the reusable definition; a WorkflowRun is one execution against a Profile, BookOfWork, Seed set, Target, or Application.

## Tasks

- [x] Define an onboarding/catalog-distillation Workflow with stages for ingesting SourceAssets, harvesting Seeds, culling weak material, priming promising material, substantiating claims, and publishing CatalogAssets.
- [x] Define the minimal WorkflowRun shape for MVP execution status, inputs, outputs, diagnostics, and human review points.
- [x] Define stage output contracts for Seeds, CatalogAssets, Misalignments, Recommendations, and Evidence.
- [x] Identify which stages can be AFK and which require human review.
- [x] Confirm no in-product WorkItem abstraction is needed for MVP.

## Deliverables

- Workflow definition design or schema draft.
- WorkflowRun output examples.
- Stage contract table with AFK/HITL notes.

## Acceptance Criteria

- [x] Workflow and WorkflowRun are clearly distinguished.
- [x] The four verbs have explicit inputs and outputs.
- [x] Human review points are identified.
- [x] The contract avoids treating normal app activity as backlog work.
- [x] Later agent-workflows integration can map to this contract without owning product semantics.

## Completion notes

The schema, fixtures, templates, documentation, and executable guards define a declarative catalog-distillation contract only. They do not implement persistence, a backend runtime, an in-product WorkItem, or Agent Workflows execution.

## Relationships

- `depends_on`: `wi-021`
- `references`: `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`, `docs/prd/mvp-book-of-work-to-application-loop.md`
