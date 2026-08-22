---
id: wi-029
title: Build Runtime Execution Adapter and PII-Safe Payload Contract
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: planned
priority: high
estimated: 3
links:
  parent:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  depends_on:
    - '[[028-define-temporal-execution-boundary-and-threat-model]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Create the direct Vitae-to-Temporal adapter contract that translates canonical WorkflowRun intent into opaque, allowlisted execution requests.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Implement typed request/result adapters, payload allowlists, denylist enforcement, and contract tests for workflow starts, signals, metadata, and diagnostics.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Adapter interface, payload contract, redaction tests, and a synthetic contract fixture.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [ ] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [ ] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [ ] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [ ] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Unit tests reject raw content keys and values, accept opaque IDs and approved status codes, and prove no client API receives unallowlisted fields.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No SDK deployment, worker process, or domain-policy implementation.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-028
- `implements`: ADR-0004
