---
id: documentation-standards
type: document
subtype: standard
lifecycle: active
status: ready
title: Vitae ADR and PRD Documentation Standards
---

# Vitae ADR and PRD Documentation Standards

## Purpose

This standard defines the canonical ADR and PRD formats for Vitae. The formats are optimized for both rendered Markdown and structured-data consumption by LLMs, validation tools, and future documentation automation.

## Design Principles

- Markdown is the human-readable source.
- YAML frontmatter is the machine-readable contract.
- Stable section headings and stable requirement IDs make documents easier for agents to parse.
- A brief document is better than no document, but high-impact work should carry more explicit evidence, alternatives, and validation.
- Decisions, product intent, backlog execution, and evidence records are separate artifacts.

## Artifact Types

| Type | Owns | Does Not Own | Template | Schema |
| --- | --- | --- | --- | --- |
| ADR | One durable architecture-significant decision and its rationale | Product requirement discovery or implementation task tracking | `templates/docs/adr-template.md` | `schemas/docs/adr.schema.json` |
| PRD | Product problem, outcomes, users, requirements, success measures, and scope | Final architecture decisions or task-by-task implementation history | `templates/docs/prd-template.md` | `schemas/docs/prd.schema.json` |

## ADR Standard

Use an ADR when a decision meaningfully affects system structure, data contracts, privacy/security posture, product boundaries, provider choices, or long-term operational behavior.

Always include:

- frontmatter matching `schemas/docs/adr.schema.json`
- LLM Snapshot
- Status
- Context and Problem Statement
- Decision Drivers
- Considered Options
- Decision Outcome
- Consequences
- Confirmation

Recommended for `standard` and expected for `full`:

- option details with pros, cons, and neutral trade-offs
- implementation notes
- related work links
- open questions
- supersession links when replacing an earlier ADR

## PRD Standard

Use a PRD when work needs product alignment before implementation: new user journeys, major capabilities, scoring behavior, artifact generation, workflow orchestration, or cross-system integrations.

Always include:

- frontmatter matching `schemas/docs/prd.schema.json`
- LLM Snapshot
- Status
- Problem Statement
- Goals
- Non-Goals
- Users and Use Cases
- Requirements with stable IDs
- Success Metrics
- Assumptions
- Risks and Mitigations
- Open Questions

Recommended for `standard` and expected for `full`:

- user experience notes
- data and contract notes
- launch and readiness plan
- backlog mapping
- related ADRs and research

## Maturity Levels

| Level | Use When | Expected Depth |
| --- | --- | --- |
| `brief` | The change is low-risk, local, or exploratory. | Required sections only, concise prose, at least one success or confirmation signal. |
| `standard` | The change affects product behavior, user workflows, API/data contracts, or more than one module. | Required sections plus options, risks, metrics, and backlog/implementation linkage. |
| `full` | The change is cross-system, privacy/security-sensitive, strategically important, or hard to reverse. | Full template, explicit evidence, alternatives, rollout/readiness, validation plan, and traceability links. |

## Complexity Levels

| Level | Signals |
| --- | --- |
| `low` | One user flow or module; reversible; limited ambiguity. |
| `medium` | Multiple modules, moderate data/API effects, or meaningful product trade-offs. |
| `high` | Cross-system boundaries, durable data model changes, privacy/security implications, migrations, or long-term platform direction. |

## LLM Consumption Rules

- Keep the `llm.purpose` field short and direct.
- Put the questions an agent should answer in `llm.canonicalQuestions`.
- Use stable IDs for requirements, metrics, ADRs, and backlog references.
- Keep one decision per ADR.
- Keep one product problem or initiative per PRD.
- Use links rather than duplicating long external context.
- Prefer tables for requirement, metric, risk, and backlog mappings.
- Distinguish current implementation from intended future work.

## Validation Expectations

For schema changes:

- use JSON Schema draft 2020-12
- keep `$id`, `title`, and `description` stable
- factor shared definitions through `schemas/docs/common.schema.json`
- add examples or fixtures before making validation stricter

For document changes:

- validate frontmatter against the declared schema when tooling exists
- run `git diff --check`
- keep rendered Markdown readable without requiring a custom renderer

## Source Standards Considered

The ADR format is based on the widely used Nygard ADR shape: title, status, context, decision, and consequences, with MADR additions such as decision drivers, considered options, pros/cons, and confirmation.

The PRD format follows common agile PRD practice: concise product purpose, goals, assumptions, user stories/use cases, requirements, UX/design notes, success metrics, open questions, and explicit out-of-scope boundaries.

