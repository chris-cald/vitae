---
namespace: vitae.sdlc
type: prd
$schema: ../schemas/metadata/prd.json
$content_schema: ../schemas/content/prd.json
id: prd-short-title
status: draft
title: Product or Feature Title
created: '2026-08-12'
lastUpdated: '2026-08-12'
owners:
  - name: Product Owner
    role: product owner
maturity: standard
complexity: medium
productArea: career-workspace
primaryUsers:
  - candidate
problemRefs: []
relatedAdrs: []
backlogItems: []
successMetricIds: []
links: []
tags: []
llm:
  purpose: Define the product problem, target users, required behavior, success measures, and delivery boundaries.
  canonicalQuestions:
    - What user problem are we solving?
    - What outcomes must the product create?
    - What is explicitly in and out of scope?
    - How will we know it worked?
  readerHints:
    - Read Problem, Goals, Non-Goals, and Requirements before implementation details.
    - Treat requirements as product intent until backlog items and tests prove implementation.
---

# PRD: Product or Feature Title

## LLM Snapshot

- **Problem:** One sentence.
- **Primary user:** One sentence.
- **Outcome:** One sentence.
- **Scope boundary:** One sentence.
- **Success signal:** One sentence.

## Status

Draft.

Allowed statuses: `draft`, `reviewing`, `approved`, `implementing`, `launched`, `deprecated`, `superseded`.

## Problem Statement

Describe the user problem in 2-4 sentences.

Always include:

- who experiences the problem
- what they are trying to accomplish
- why the current state is insufficient
- what evidence supports the problem

## Goals

- Goal 1
- Goal 2

Goals should describe outcomes, not implementation tasks.

## Non-Goals

- Non-goal 1
- Non-goal 2

Use this section to prevent scope creep.

## Users and Use Cases

### Primary Users

- User type: need or situation.

### Core Use Cases

- As a ..., I want ..., so that ...

For `brief` PRDs, one primary use case is enough. For `full` PRDs, include personas, user journey notes, and edge cases.

## Requirements

Use stable IDs so LLMs, backlog items, tests, and implementation notes can refer to requirements without relying on prose position.

| ID | Requirement | Priority | Acceptance Signal |
| --- | --- | --- | --- |
| REQ-001 | The system must ... | Must | ... |

Priority values: `Must`, `Should`, `Could`, `Won't`.

## User Experience Notes

Optional for `brief`; recommended for `standard`; expected for `full`.

- Main flow
- Empty states
- Error states
- Review or approval moments
- Accessibility considerations

## Data and Contracts

Optional for `brief`; recommended for `standard`; expected for `full`.

- Input entities
- Output entities
- Schema changes
- API contracts
- Provenance or traceability requirements

## Success Metrics

Use IDs that match `successMetricIds` in frontmatter.

| ID | Metric | Target | Measurement Method |
| --- | --- | --- | --- |
| metric-001 | ... | ... | ... |

## Assumptions

- Assumption 1

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| ... | ... | ... |

## Launch and Readiness

Optional for `brief`; recommended for `standard`; expected for `full`.

- Rollout plan
- Migration plan
- Observability
- Support/readiness
- Documentation updates

## Open Questions

| Question | Owner | Resolution Date |
| --- | --- | --- |
| ... | ... | ... |

## Backlog Mapping

Map requirements to executable backlog items when ready.

| Requirement ID | Backlog Item | Notes |
| --- | --- | --- |
| REQ-001 | ... | ... |

## Related Work

- Related ADRs
- Research
- Design artifacts
- Source files
