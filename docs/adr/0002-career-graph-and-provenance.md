---
$schema: ../../schemas/docs/adr.schema.json
id: adr-0002-career-graph-and-provenance
type: adr
status: proposed
title: Use a Provenance-Preserving Career Graph for Traceable Analysis
decisionDate: 2026-08-04
lastUpdated: 2026-08-04
owners:
  - name: Vitae engineering owner
    role: decision owner
maturity: full
complexity: high
decisionScope:
  - architecture
  - data-model
  - ai-ml
  - privacy
affectedSystems:
  - vitae
  - semantify
  - context-graph
links:
  - label: Career workflow platform PRD
    href: ../prd/career-workflow-platform-boundaries.md
    relationship: related
  - label: System boundary ADR
    href: 0001-vitae-system-boundaries.md
    relationship: related
tags:
  - provenance
  - career-graph
  - semantic-scoring
llm:
  purpose: Record the decision to represent traceable career facts as graph nodes and edges with source provenance, confidence, and projection metadata.
  canonicalQuestions:
    - Why does Vitae need a career graph?
    - What facts should carry provenance?
    - How do embeddings fit into semantic scoring?
    - What should Context Graph own versus Semantify and Vitae?
  readerHints:
    - Read this ADR before implementing semantic scoring, recommendation provenance, or generated artifact traceability.
    - Treat embeddings as a signal, not as the whole semantic model.
---

# ADR-0002: Use a Provenance-Preserving Career Graph for Traceable Analysis

## LLM Snapshot

- **Decision:** Vitae will model traceable career facts as a provenance-preserving graph of nodes and edges.
- **Why now:** Requirement mapping, recommendations, generated bullets, and application records need source traceability to be trustworthy.
- **Chosen because:** A graph can connect source evidence, semantic facts, scoring, generated artifacts, applications, and decisions without making any one output the source of truth.
- **Watch for:** Any generated recommendation or score that cannot identify its source evidence, match method, and confidence should be treated as incomplete.

## Status

Proposed.

> **Canonical MVP scope note (2026-08-17):** [ADR-0003](0003-canonical-vitae-domain-and-workflow-boundary.md) and the [MVP PRD](../prd/mvp-book-of-work-to-application-loop.md) define the product vocabulary and adapter boundary. The graph candidates in this ADR remain implementation guidance; MVP provenance begins with canonical `SourceRef`, `Evidence`, and `Relationship` contracts rather than a graph persistence requirement.

## Context and Problem Statement

Vitae's core product promise depends on transparent job-fit analysis and actionable resume improvement feedback. Embeddings can help find similar concepts, but they do not by themselves explain which source evidence supports a requirement, how a score was produced, or whether generated text is authentic. A candidate or reviewer should be able to inspect the chain from source document to semantic fact to score contribution to recommendation or generated artifact.

How should Vitae add traceability to projections, applications, resume bullets, generated artifacts, and scoring?

This decision is architecture-significant because it changes how analysis results, recommendations, and generated outputs are represented and validated.

## Decision Drivers

- Users need trust, explainability, and authenticity checks.
- Resume and job data can contain sensitive personal and employer information.
- Generated recommendations must not silently invent unsupported claims.
- Semantic scoring should combine multiple signals, not only vector similarity.
- Future agents need structured provenance to safely continue work.
- The graph substrate should stay reusable and domain-neutral.

## Considered Options

- Store provenance inline on analysis and recommendation records only.
- Use embeddings and freeform explanations without a graph.
- Use a provenance-preserving career graph backed by Semantify and Context Graph boundaries.

## Decision Outcome

Chosen option: **Use a provenance-preserving career graph backed by Semantify and Context Graph boundaries**, because it gives Vitae a durable way to connect source documents, semantic projections, scoring facts, generated artifacts, applications, and lifecycle records.

Responsibility split:

- **Semantify** interprets source observations into semantic records, graph facts, diagnostics, and projection provenance.
- **Context Graph** indexes graph primitives, provider-scoped writes, deterministic snapshots, query, and provenance-bearing nodes and edges.
- **Vitae** uses the graph to produce user-facing scores, explanations, recommendations, and workflows.

Embeddings remain useful for retrieval, fuzzy matching, clustering, and candidate requirement matching, but embedding similarity is recorded as one match signal with method, confidence, source evidence, and explanation.

## Consequences

- Good: Requirement mappings can point to exact resume bullets, source spans, and match methods.
- Good: Generated bullets and cover-letter text can identify source evidence and human-confirmation needs.
- Good: Applications can link jobs, companies, documents, submission evidence, decisions, and follow-up records.
- Good: Agents can query stable facts instead of re-reading all prose each turn.
- Bad: The data model becomes more explicit and requires projection/graph contracts.
- Bad: Source-span coverage may be incomplete for older imported artifacts.
- Neutral: Early graph snapshots can be generated artifacts before becoming a persistent service.

## Confirmation

Compliance will be checked through:

- Fit-analysis contracts that expose evidence, confidence, and match method.
- Recommendation contracts that identify source evidence or flag human confirmation.
- Tests or fixtures for at least one projection from resume bullet to job requirement mapping.
- Privacy review ensuring provenance does not introduce raw-content logs or unsafe exports.
- Documentation and backlog items referencing this ADR for semantic-scoring work.

## Option Details

### Store provenance inline on analysis and recommendation records only

Each analysis output includes source references without introducing a graph layer.

- Good: Simpler initial implementation.
- Good: Easy to add to existing API responses.
- Bad: Harder to query across applications, variants, decisions, and generated artifacts.
- Bad: Provenance rules may drift between output types.
- Neutral: Useful as a migration step if shaped like future graph facts.

### Use embeddings and freeform explanations without a graph

The system calculates similarity and asks models to explain the result.

- Good: Fast to prototype.
- Good: Can produce plausible user-facing copy.
- Bad: Weak traceability and auditability.
- Bad: Hard to detect unsupported generated claims.
- Bad: Makes scoring less deterministic and harder to test.

### Use a provenance-preserving career graph

Career facts are represented as nodes and edges with source, projection, confidence, and method metadata.

- Good: Supports explainability, scoring, recommendations, application tracking, and generated artifact traceability.
- Good: Matches the system boundary between Semantify and Context Graph.
- Good: Gives agents a stable query substrate.
- Bad: Requires explicit graph contracts and projection rules.
- Neutral: Can start with small slices such as resume bullet to job requirement.

## Implementation Notes

Initial graph node candidates:

- candidate
- resume
- resume variant
- resume bullet
- job
- company
- job requirement
- application
- evidence record
- recommendation
- generated artifact

Initial edge candidates:

- `contains`
- `targets`
- `evidences`
- `matches`
- `derivedFrom`
- `usedDocument`
- `submittedTo`
- `requiresConfirmation`

Initial provenance fields:

- source document ID
- source URI
- source span or source location when available
- projection rule ID or match method
- provider/model/rule identifier when relevant
- confidence
- target node or edge ID

## Open Questions

- What stable ID scheme should be used for career graph nodes and edges?
- Which source formats can provide reliable source spans in the first implementation slice?
- Should graph snapshots be stored in the database, generated as artifacts, or both?

## Related Work

- `docs/prd/career-workflow-platform-boundaries.md`
- `docs/adr/0001-vitae-system-boundaries.md`
- `backend/schemas/json/job-fit-analysis.schema.json`
- `backend/schemas/json/job-requirement-mapping.schema.json`

