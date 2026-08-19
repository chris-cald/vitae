---
id: wi-017
title: Integrate agent-workflows for Work Order Execution
summary: Define and prototype how Vitae or its Obsidian-backed work orders can delegate bounded execution to agent-workflows.
type: work-item
subtype: spike
lifecycle: active
status: ready
status_reason: auto
priority: medium
estimated: 5
links:
  depends_on:
    - '[[016-define-doc-vader-compatible-evidence-records-for-applications]]'
  reference:
    - '[[../docs/adr/0001-vitae-system-boundaries]]'
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
tags:
  - agent-workflows
  - work-orders
  - orchestration
  - execution
---

## Goal

Define the first safe boundary between Vitae career workflows and agent-workflows execution.

## Background

The ChatGPT project already expects agents to locate active Work Orders and continue the next actionable item. agent-workflows can provide deterministic and reasoning-based workflow execution for claims, run records, review gates, and resumability, but Vitae needs a clear adapter boundary before relying on it.

## Tasks

- [ ] Identify one Work Order or application workflow suitable for an execution prototype.
- [ ] Define the input that Vitae or Obsidian provides to agent-workflows.
- [ ] Define the output records Vitae expects back, including evidence and status.
- [ ] Map readiness, claim, run record, review, and close semantics.
- [ ] Prototype or document a minimal workflow without mutating production user data.

## Deliverables

- Integration boundary design or prototype.
- Input/output contract for one workflow.
- Follow-up implementation plan for safe execution.

## Acceptance Criteria

- [ ] The prototype or design identifies ownership between Vitae, doc-vader records, and agent-workflows runs.
- [ ] Execution outputs include evidence or status records.
- [ ] The boundary avoids letting LLM reasoning own branch identity, lifecycle authority, or final user-facing attestation.
- [ ] Next implementation slice is small and testable.

## Relationships

- `depends_on`: `wi-016`
- `references`: `docs/adr/0001-vitae-system-boundaries.md`

