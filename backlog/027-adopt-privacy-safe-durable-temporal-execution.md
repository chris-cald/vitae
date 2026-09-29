---
id: wi-027
title: Adopt Privacy-Safe Durable Temporal Execution
type: work-item
subtype: epic
lifecycle: active
status: ready
status_reason: MVP-blocking after expanded UAT scope adopted Temporal for durable execution
priority: high
estimated: 21
links:
  depends_on:
    - '[[022-define-harvest-cull-prime-and-substantiate-workflow-contracts]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - privacy
  - workflow
  - epic
---

## Goal

Adopt Temporal as a privacy-safe durable execution substrate for Vitae without transferring canonical domain, scoring, promotion, approval, or WorkItem authority from Vitae.

## Background

WI-022 supplies declarative workflow contracts but no durable runtime. ADR-0004 selects direct Vitae-owned Temporal integration and excludes `agent-workflows` from the product path. This epic coordinates ordered foundation work and MVP-blocking runtime adoption slices; it does not change the completed contract/fixture evidence of WI-023 through WI-026.

## Tasks

- Establish the architecture, privacy, and operations boundary.
- Build an adapter, isolated worker, ledger, and human-review bridge.
- Deliver guarded Harvest/Cull/Prime/Substantiate runtime slices.
- Implement durable adoption for downstream product slices needed by expanded MVP UAT.
- Prove UAT and Temporal Activities do not mutate canonical files/catalog under `~/Obsidian Vaults/loft/1 Projects/Job Search/`.
- Make a Cloud-versus-self-hosted adoption decision only after operational evidence exists.

## Deliverables

- ADR-0004, execution plan, and child work-item evidence.
- A tested, privacy-safe durable execution foundation.
- Durable runtime slices for target/catalog fit, deliverable generation, application automation, and Book of Work refresh.

## Acceptance Criteria

- [x] All children link to this epic using Doc-Vader-supported parent links.
- [x] No child makes Temporal canonical domain, policy, or WorkItem authority.
- [x] Sensitive career/model/reviewer content is excluded from Temporal and its adjacent metadata surfaces.
- [x] Runtime slices required for expanded MVP UAT are implemented without invalidating WI-023 through WI-026 contract/fixture evidence.
- [x] UAT no-write evidence harness proves canonical Obsidian vault file/catalog mutations are detected; live no-write artifact remains WI-040 evidence.
- [ ] WI-040 records the operational adoption decision with required evidence.

## Exclusions

- Product-code implementation is not performed by this epic artifact itself.
- No Cloud or self-hosted Temporal choice is made before WI-040.
- Babysitter and `agent-workflows` are not added to the Vitae product runtime.

## Relationships

- `depends_on`: WI-022
- `implements`: ADR-0004
