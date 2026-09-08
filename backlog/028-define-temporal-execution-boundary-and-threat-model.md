---
id: wi-028
title: Define Temporal Execution Boundary and Threat Model
type: work-item
subtype: story
lifecycle: active
status: closed
status_reason: development-only-provisional-approval
priority: high
estimated: 3
links:
  parent:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  depends_on:
    - '[[022-define-harvest-cull-prime-and-substantiate-workflow-contracts]]'
  implements:
    - '[[../docs/adr/0004-adopt-privacy-safe-temporal-execution-substrate]]'
tags:
  - temporal
  - security
  - architecture
---

## Goal

Turn ADR-0004 into an approved implementation boundary and threat model before any Temporal client, worker, or sensitive-data integration is introduced.

## Background

Temporal durability is useful only if domain policy remains in Vitae and all Temporal surfaces remain free of raw career, prompt, completion, secret, and reviewer content.

## Tasks

- Map trusted components, data flows, tenant/actor checks, and failure modes.
- Define allowlisted payload, signal, search-attribute, memo, log, metric, diagnostic, label, and fixture fields.
- Specify encryption, retention/deletion, access, incident, and Cloud-versus-self-hosted decision evidence.
- Review the boundary with security, backend, and operations owners.

## Deliverables

- Threat model and data-flow diagram using synthetic identifiers only.
- Payload allowlist/denylist and operational control checklist.
- ADR-0004 compliance review record.

## Acceptance Criteria

- [x] The design explicitly assigns domain/policy authority to Vitae and execution mechanics to Temporal.
- [x] Every Temporal-adjacent data surface has an allowlist and raw-content denylist.
- [x] Stop conditions cover raw resume/JD/prompt/completion/secret/reviewer prose exposure.
- [x] Cloud-versus-self-hosted evaluation criteria are documented without selecting a provider.
- [x] Security and operations review evidence is attached or the item remains blocked.

## Test and Evidence

- Threat-model review uses synthetic fixtures only.
- A static payload-contract test plan names every Temporal client/worker/logging entry point.
- ADR/reference links resolve through Doc-Vader.

## Exclusions

- No Temporal deployment, SDK installation, worker, or product endpoint.
- No provider selection.

## Completion notes

- `docs/career/temporal-execution-threat-model.md` supplies the synthetic-only data-flow, payload allowlist/denylist, stop conditions, operational controls, Cloud/self-host evidence checklist, static test plan, and pending review record.
- The user explicitly provided a **development-only provisional approval** for the security/privacy, backend/service, operations, and decision-owner review areas on 2026-08-20. This closes WI-028 only for non-production contract work. Production deployment remains blocked pending role-specific, dated review evidence and the WI-040 adoption decision.

## Relationships

- `parent`: WI-027
- `depends_on`: WI-022
- `implements`: ADR-0004
