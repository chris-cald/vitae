---
$schema: ../../schemas/docs/adr.schema.json
id: adr-0000-short-title
type: adr
status: proposed
title: Short Decision Title
decisionDate: 2026-08-04
lastUpdated: 2026-08-04
owners:
  - name: Product or Engineering Owner
    role: decision owner
maturity: standard
complexity: medium
decisionScope:
  - architecture
affectedSystems:
  - vitae
links: []
tags: []
llm:
  purpose: Record one architecture-significant decision and enough context to understand why it was made.
  canonicalQuestions:
    - What decision was made?
    - Why was this option chosen over alternatives?
    - What consequences and follow-up checks matter?
  readerHints:
    - Read Decision Outcome before option details.
    - Treat this file as decision history, not a design proposal.
---

# ADR-0000: Short Decision Title

## LLM Snapshot

- **Decision:** One sentence describing the chosen option.
- **Why now:** One sentence describing the pressure, risk, or opportunity.
- **Chosen because:** One sentence naming the strongest decision driver.
- **Watch for:** One sentence naming the most important consequence or revisit trigger.

## Status

Proposed.

Allowed statuses: `proposed`, `accepted`, `rejected`, `deprecated`, `superseded`.

## Context and Problem Statement

Describe the factual context and the architecture-significant problem. Prefer a concrete question:

> How should Vitae ...?

Always include:

- the current state
- the force or problem that requires a decision
- why the decision is architecture-significant

## Decision Drivers

- Driver 1
- Driver 2
- Driver 3

Examples: privacy, explainability, provider independence, local-first operation, implementation cost, reliability, user trust.

## Considered Options

- Option A
- Option B
- Option C

## Decision Outcome

Chosen option: **Option A**, because ...

## Consequences

- Good: ...
- Bad: ...
- Neutral: ...

## Confirmation

Describe how compliance will be checked.

Examples:

- code review checklist
- schema validation
- API contract test
- architecture boundary test
- product acceptance review

## Option Details

### Option A

Description.

- Good: ...
- Bad: ...
- Neutral: ...

### Option B

Description.

- Good: ...
- Bad: ...
- Neutral: ...

## Implementation Notes

Optional for `brief`; recommended for `standard`; expected for `full`.

- Migration steps
- Compatibility notes
- Data or API changes
- Rollout sequence

## Open Questions

- Question 1

## Related Work

- Link related PRDs, backlog items, source files, research, or superseded ADRs.

