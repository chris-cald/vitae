---
$schema: ../../schemas/docs/prd.schema.json
id: prd-career-workflow-platform-boundaries
type: prd
status: draft
title: Vitae Career Workflow Platform Boundaries
created: 2026-08-04
lastUpdated: 2026-08-04
owners:
  - name: Vitae product owner
    role: product owner
maturity: full
complexity: high
productArea: career-workspace
primaryUsers:
  - candidate
  - career-coach
  - placement-professional
  - developer
  - agent
problemRefs:
  - label: Vitae README
    href: ../../README.md
    relationship: source
relatedAdrs:
  - adr-0001-vitae-system-boundaries
  - adr-0002-career-graph-and-provenance
backlogItems: []
successMetricIds:
  - metric-boundary-clarity
  - metric-traceable-analysis
  - metric-reusable-capabilities
links:
  - label: Documentation standards
    href: ../documentation-standards.md
    relationship: related
tags:
  - career-workflow
  - system-boundaries
  - platform
llm:
  purpose: Define Vitae as the career workflow product shell and identify which reusable systems should own semantic projection, provenance, rendering, lifecycle governance, and workflow execution.
  canonicalQuestions:
    - What should Vitae own as the product?
    - Which capabilities should be delegated to Semantify, Context Graph, templjs, doc-vader, and agent-workflows?
    - What product outcomes should these boundaries enable?
    - What work should be prioritized first?
  readerHints:
    - Read the LLM Snapshot, Goals, Non-Goals, and Requirements before implementation planning.
    - Treat this PRD as product direction until backlog items and tests prove implementation.
---

# PRD: Vitae Career Workflow Platform Boundaries

## LLM Snapshot

- **Problem:** Vitae risks becoming a product, semantic engine, document renderer, lifecycle system, and agent runtime all at once.
- **Primary user:** Candidates and career-support professionals need trustworthy resume/job workflow assistance with explainable decisions.
- **Outcome:** Vitae should present a coherent career workspace while delegating reusable mechanics to sharper subsystems.
- **Scope boundary:** Vitae owns UX, orchestration, and career-domain product decisions; supporting systems own deep reusable capabilities.
- **Success signal:** Future product work can state which layer owns each behavior and can trace analyses, recommendations, and generated artifacts back to source evidence.

## Status

Draft.

> **Canonical MVP scope note (2026-08-17):** This is a long-range boundary PRD. For MVP vocabulary, sequencing, and persistence authority, follow [ADR-0003](../adr/0003-canonical-vitae-domain-and-workflow-boundary.md) and the [Book of Work to Application MVP PRD](mvp-book-of-work-to-application-loop.md). Supporting-system integrations are contracts, not MVP runtime prerequisites.

## Problem Statement

Vitae currently has a strong resume/job-fit product direction, but its roadmap spans semantic scoring, document generation, lifecycle management, and agent execution. Without explicit product boundaries, the app can accumulate too many responsibilities and make future features hard to explain, validate, reuse, or delegate. Users need fit analyses and resume recommendations they can trust, which requires traceability from source career evidence through scoring, recommendations, generated artifacts, and workflow outcomes. The current documentation and codebase show the product direction, but the target architecture needs a durable product-level framing before implementation expands.

## Goals

- Define Vitae as the user-facing career workflow product and orchestration shell.
- Preserve explainability and provenance as product-level requirements, not later implementation details.
- Make reusable capability boundaries explicit for Semantify, Context Graph, templjs, doc-vader, and agent-workflows.
- Separate scoring, recommendation generation, document rendering, lifecycle governance, and workflow execution.
- Provide a foundation for backlog items that can be implemented in small, verifiable slices.

## Non-Goals

- Do not extract any package or repository as part of this PRD.
- Do not replace the current FastAPI/React application architecture in one migration.
- Do not require every early feature to adopt every supporting system immediately.
- Do not make embeddings the sole semantic scoring authority.
- Do not turn Vitae into a generic project-management or workflow-engine product.

## Users and Use Cases

### Primary Users

- Candidate: wants to understand fit for a job and improve application materials without inventing unsupported claims.
- Career coach: wants to review evidence, gaps, and recommendations quickly across multiple roles.
- Placement professional: wants consistent fit analysis and application packet generation for many candidates.
- Developer: wants clear boundaries when changing product behavior, scoring logic, data contracts, or workflow execution.
- Agent: needs stable contracts, provenance, and readiness signals to safely continue work.

### Core Use Cases

- As a candidate, I want to see which resume evidence supports each job requirement so that I can trust the analysis.
- As a candidate, I want generated bullets and cover-letter text to identify source evidence so that I can judge authenticity.
- As a career coach, I want application status, submission evidence, and decision records in one workspace so that I can understand progress.
- As a developer, I want each feature to identify its owning layer so that reusable capabilities do not become tangled in the product shell.
- As an agent, I want structured product, architecture, and lifecycle records so that I can choose the next safe action.

## Requirements

| ID | Requirement | Priority | Acceptance Signal |
| --- | --- | --- | --- |
| REQ-001 | Vitae must own the career-domain UX and orchestration for resumes, jobs, companies, contacts, applications, analyses, recommendations, and generated artifacts. | Must | Product docs and backlog items describe Vitae as product shell rather than semantic/runtime owner. |
| REQ-002 | Vitae must treat Semantify as the owner of semantic projections, scoring facts, requirement/evidence records, and related diagnostics when that integration matures. | Must | Semantic-scoring work references a projection contract rather than only ad hoc embedding similarity. |
| REQ-003 | Vitae must treat Context Graph as the provenance-preserving graph index and query substrate for traceable nodes, edges, snapshots, and source lineage. | Must | Career graph work stores or emits source URI/span/rule/confidence metadata for projected facts. |
| REQ-004 | Vitae must treat templjs as the owner of structured content extraction, validation, and rendering for career artifacts when document generation matures. | Should | Resume variant, cover-letter, brief, or prompt-bundle generation can be described as template-backed rendering. |
| REQ-005 | Vitae must treat doc-vader as the owner of documentation organization, lifecycle governance, validation, evidence records, and readiness/closure checks. | Should | Work Orders, evidence, and lifecycle records have schema-backed status and validation expectations. |
| REQ-006 | Vitae must treat agent-workflows as the owner of deterministic and reasoning-based execution mechanics, including claims, run records, review gates, and resumability. | Should | Agent-executed product work can be represented as workflow runs rather than bespoke orchestration code. |
| REQ-007 | Fit scoring and recommendation generation must be separate product capabilities. | Must | Score explanations can remain stable while recommendation text iterates independently. |
| REQ-008 | Embeddings must be treated as one semantic signal rather than the entire scoring model. | Must | Match records can identify method, confidence, evidence, and explanation beyond vector similarity. |
| REQ-009 | Generated recommendations must preserve authenticity checks and source evidence. | Must | Generated bullets or paragraphs can be traced to existing evidence or flagged as needing human confirmation. |
| REQ-010 | Product and architecture changes that cross system boundaries must be captured in PRDs or ADRs using the canonical templates. | Must | New boundary-affecting work links to conforming PRD/ADR frontmatter and sections. |

## User Experience Notes

- The analysis UI should make traceability visible without overwhelming the user.
- Requirement-level fit views should show evidence, confidence, match method, and gaps.
- Recommendation surfaces should distinguish source-backed edits from speculative improvements.
- Application workflows should show status and evidence history, not only current state.
- Advanced provenance and graph views can be progressively disclosed for reviewers, developers, and agents.

## Data and Contracts

- Career-domain entities should include candidate, resume, resume variant, job, company, contact, application, requirement, evidence, analysis, recommendation, generated artifact, and record.
- Provenance-bearing facts should include source document identity, source location/span when available, projection rule or method, confidence, and target node or edge.
- Fit analysis should separate scoring facts from generated feedback text.
- Document generation should define input contracts and rendered outputs instead of mixing templates, prompts, and freeform text.
- Lifecycle records should distinguish evidence, decision, comment, approval, and validation events.

## Success Metrics

| ID | Metric | Target | Measurement Method |
| --- | --- | --- | --- |
| metric-boundary-clarity | Boundary clarity for new roadmap items | New major backlog items name their owning layer | Review backlog item frontmatter/body during planning |
| metric-traceable-analysis | Traceable fit-analysis outputs | Requirement mappings expose evidence and confidence for core flows | API/UI contract review and tests |
| metric-reusable-capabilities | Reusable subsystem adoption | At least one document-generation, lifecycle, workflow, or semantic capability is delegated behind a clear adapter boundary | Architecture review against ADRs |

## Assumptions

- Vitae remains the product surface even if some reusable capabilities live in separate packages or repos later.
- Users will value explainability and authenticity more than opaque one-shot generated advice.
- Early integration can be adapter-backed and incremental rather than a large rewrite.
- Markdown plus structured frontmatter remains useful for agent-readable product and architecture records.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Boundary over-design slows product progress | Features stall behind architecture work | Implement boundaries incrementally and prioritize immediate privacy/provenance fixes |
| Too many systems make the product harder to understand | Contributors cannot tell where behavior belongs | Keep Vitae README and ADRs concise; require owning layer in backlog items |
| Provenance data becomes noisy or incomplete | Users do not trust traceability | Start with high-value source spans and confidence fields for bullets and requirements |
| Embedding-only scoring appears simpler | Explainability and authenticity suffer | Require match method, confidence, and evidence in scoring contracts |

## Launch and Readiness

- Start by documenting boundary decisions and adding small backlog items.
- Fix PII-bearing model logs before expanding model-generated workflows.
- Prototype career graph projection for resume bullets and job requirements.
- Add typed API contracts for fit-analysis outputs before broad UI expansion.
- Add validation tooling for ADR/PRD frontmatter once the documentation format stabilizes.

## Open Questions

| Question | Owner | Resolution Date |
| --- | --- | --- |
| Which subsystem should own final score aggregation versus scoring facts? | Product/engineering |  |
| What is the first career graph slice: resume bullets to requirements, or applications to artifacts? | Product/engineering |  |
| Should application lifecycle records live in Obsidian, the app database, or both? | Product/engineering |  |

## Backlog Mapping

| Requirement ID | Backlog Item | Notes |
| --- | --- | --- |
| REQ-003 | Prototype career graph projection for resume bullets and job requirements | Proposed |
| REQ-007 | Split scoring from recommendation generation | Proposed |
| REQ-009 | Add provenance fields to recommendation outputs | Proposed |
| REQ-010 | Add ADR/PRD validation tooling | Proposed |

## Related Work

- `docs/adr/0001-vitae-system-boundaries.md`
- `docs/adr/0002-career-graph-and-provenance.md`
- `docs/documentation-standards.md`
- `templates/docs/prd-template.md`

