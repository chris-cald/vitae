---
$schema: ../../schemas/docs/adr.schema.json
id: adr-0001-vitae-system-boundaries
type: adr
status: proposed
title: Define Vitae Product and Supporting System Boundaries
decisionDate: 2026-08-04
lastUpdated: 2026-08-04
owners:
  - name: Vitae engineering owner
    role: decision owner
maturity: full
complexity: high
decisionScope:
  - product
  - architecture
  - workflow
  - documentation
affectedSystems:
  - vitae
  - semantify
  - context-graph
  - templjs
  - doc-vader
  - agent-workflows
links:
  - label: Career workflow platform PRD
    href: ../prd/career-workflow-platform-boundaries.md
    relationship: related
tags:
  - system-boundaries
  - product-architecture
  - career-workflow
llm:
  purpose: Record the decision that Vitae owns product UX and orchestration while supporting systems own semantic projection, provenance, rendering, lifecycle governance, and execution mechanics.
  canonicalQuestions:
    - What does Vitae own?
    - What do supporting systems own?
    - Why should these boundaries be explicit?
    - How will compliance be confirmed?
  readerHints:
    - Read Decision Outcome before Option Details.
    - Treat this as a boundary decision, not an extraction mandate.
---

# ADR-0001: Define Vitae Product and Supporting System Boundaries

## LLM Snapshot

- **Decision:** Vitae will be the career workflow product shell, with reusable semantic, graph, rendering, lifecycle, and workflow mechanics delegated to supporting systems.
- **Why now:** Vitae's roadmap spans multiple deep capabilities that need clear ownership before implementation expands.
- **Chosen because:** Explicit boundaries preserve explainability, reuse, and maintainability without blocking incremental product work.
- **Watch for:** Any feature that mixes product UX, scoring facts, rendering, lifecycle mutation, and agent execution in one module should trigger review.

## Status

Proposed.

> **Canonical MVP scope note (2026-08-17):** [ADR-0003](0003-canonical-vitae-domain-and-workflow-boundary.md) is the vocabulary and product-model authority for the MVP. References here to Doc-Vader Work Orders describe SDLC governance artifacts; they do not introduce an in-product Vitae `WorkItem` type.

## Context and Problem Statement

Vitae helps users parse resumes and jobs, analyze fit, and improve application materials. The target direction also includes semantic scoring, traceability, document generation, lifecycle records, and agent-executed work. If Vitae owns all of these mechanics directly, the product risks becoming difficult to validate and extend.

How should Vitae divide responsibilities between the product shell and supporting reusable systems?

This decision is architecture-significant because it affects module boundaries, data contracts, future integrations, validation strategy, and how agents safely continue work.

## Decision Drivers

- Preserve a coherent user-facing career workflow product.
- Keep semantic scoring explainable and traceable.
- Avoid embedding workflow-engine behavior inside product UI code.
- Enable structured document generation without bespoke rendering logic.
- Keep lifecycle and evidence governance machine-checkable.
- Support incremental adoption rather than a big-bang rewrite.

## Considered Options

- Vitae owns all product and platform mechanics directly.
- Vitae delegates reusable mechanics to explicit supporting systems.
- Delay boundary decisions until implementation pressure forces them.

## Decision Outcome

Chosen option: **Vitae delegates reusable mechanics to explicit supporting systems**, because this keeps Vitae focused on product orchestration while allowing semantic projection, provenance, rendering, lifecycle governance, and workflow execution to mature behind clear contracts.

Boundary ownership:

- **Vitae:** UX, career-domain orchestration, application workspace, product scoring surfaces, recommendation experiences, and user-facing decisions.
- **Semantify:** semantic projection, semantic facts, requirement/evidence records, diagnostics, and scoring inputs.
- **Context Graph:** graph primitives, provenance-preserving snapshots, provider-scoped writes, deterministic query, and traceability substrate.
- **templjs:** structured content extraction, validation, and rendering for resume variants, cover letters, reports, and prompt/context bundles.
- **doc-vader:** documentation organization, lifecycle governance, Work Orders, evidence records, readiness/closure checks, and validation gates.
- **agent-workflows:** historical code-factory/workflow tooling; not on the Vitae product execution path.
- **Temporal (per [ADR-0004](0004-adopt-privacy-safe-temporal-execution-substrate.md)):** durable execution mechanics behind a direct Vitae-owned adapter; it does not own product-domain policy, canonical records, or WorkItems.
- **Babysitter:** deterministic engineering/code-factory workflow execution; not a Vitae product runtime.

## Consequences

- Good: Product work can name the layer that owns each behavior.
- Good: Reusable capabilities can mature without turning Vitae into a large mixed-responsibility system.
- Good: Agents get clearer boundaries for future implementation.
- Bad: Early work may require extra adapter and contract design.
- Bad: Some boundaries may remain conceptual until the first integration slice proves them.
- Neutral: Vitae can still host temporary implementations when a boundary is documented and migration path is clear.

## Confirmation

Compliance will be checked through:

- PRDs and backlog items naming affected systems and owning layer.
- ADR review for changes that cross product, semantic, graph, rendering, lifecycle, or workflow boundaries.
- Code review checks that keep HTTP/UI orchestration separate from reusable mechanics.
- Future contract tests around semantic projection, provenance, rendering, lifecycle records, and workflow execution.

## Option Details

### Vitae owns all product and platform mechanics directly

Vitae implements UX, scoring, semantic graph logic, rendering, lifecycle records, and agent execution in the app codebase.

- Good: Fastest path for initial prototypes.
- Good: Fewer package or integration dependencies at first.
- Bad: Creates a broad product blob that is hard to reason about.
- Bad: Makes reuse across tooling and agent workflows harder.
- Bad: Increases the chance of privacy, traceability, and lifecycle rules drifting across modules.

### Vitae delegates reusable mechanics to explicit supporting systems

Vitae stays product-focused and adopts supporting systems behind stable contracts.

- Good: Clarifies ownership and accountability.
- Good: Encourages reusable contracts for semantic projection, provenance, rendering, lifecycle, and execution.
- Good: Supports LLM-readable documentation and future automation.
- Bad: Requires careful sequencing and adapter boundaries.
- Neutral: Some subsystems may initially be represented by contracts before full integration.

### Delay boundary decisions until implementation pressure forces them

The team continues building and formalizes boundaries later.

- Good: Avoids premature abstraction.
- Bad: Makes later extraction or cleanup more expensive.
- Bad: Lets product, workflow, and semantic decisions drift into implementation details.
- Neutral: Useful only for very small experiments.

## Implementation Notes

- Add product and architecture documents using the canonical PRD/ADR templates.
- Prioritize small integration slices over broad migrations.
- Start with provenance-bearing fit analysis and PII-safe logging because they immediately affect user trust.
- Allow temporary in-repo implementations when they explicitly name their intended long-term owner.

## Open Questions

- Should score aggregation belong to Vitae or Semantify once semantic facts are projected?
- Which lifecycle records should live in the app database versus authored Markdown?
- What is the first minimal adapter boundary for templjs-backed rendering?

## Related Work

- `docs/prd/career-workflow-platform-boundaries.md`
- `docs/adr/0002-career-graph-and-provenance.md`
- `docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate.md`
- `docs/documentation-standards.md`

