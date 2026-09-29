---
id: wi-030
title: Create Isolated Temporal Worker Bootstrap and Configuration Seam
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 3
links:
  parent:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  depends_on:
    - '[[028-define-temporal-execution-boundary-and-threat-model]]'
    - '[[029-build-runtime-execution-adapter-and-pii-safe-payload-contract]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - workflow
  - privacy
---

## Goal

Provide an isolated worker/bootstrap/configuration seam that cannot silently join the FastAPI process or leak sensitive configuration.

## Background

This is a child of WI-027. It implements ADR-0004’s direct Vitae-owned Temporal boundary and must preserve canonical Vitae ownership of domain semantics, scoring, promotion, authorization, and audit records.

## Tasks

- Define worker entry point, explicit task queues, environment validation, secret references, health checks, and local synthetic-data developer setup.
- Use only synthetic identifiers in test fixtures and operational evidence.
- Verify all Temporal-adjacent surfaces against the WI-028 payload allowlist.

## Deliverables

- Worker bootstrap module, configuration contract, runbook draft, and startup/invalid-configuration tests.
- Updated implementation/runbook documentation where the acceptance evidence identifies an operator action.

## Acceptance Criteria

- [x] The stated goal is delivered without granting Temporal canonical domain, scoring, promotion, or WorkItem authority.
- [x] Every Temporal-facing value is allowlisted, minimal, and free of raw resume/JD/prompt/completion/secret/reviewer content.
- [x] Failure, retry, cancellation, and authorization behavior is tested where this slice creates execution behavior.
- [x] The child’s dependencies and epic roll-up remain valid in Doc-Vader.

## Test and Evidence

- Tests prove missing required configuration fails closed, worker and API processes remain separately bootstrapped, and logs contain safe identifiers only.
- `node /Users/macos/dev/tiab/doc-vader/dist/cli/doc-vader.js backlog validate --dir backlog --fail-on error` passes after documentation changes.

## Exclusions

- No production deployment, provider selection, or real career-data fixture.
- No Babysitter or `agent-workflows` product-path integration.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-028, WI-029
- `implements`: ADR-0004
