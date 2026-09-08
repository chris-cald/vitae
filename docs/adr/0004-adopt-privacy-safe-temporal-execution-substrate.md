---
$schema: ../../schemas/docs/adr.schema.json
id: adr-0004-adopt-privacy-safe-temporal-execution-substrate
type: adr
status: accepted
title: Adopt Temporal as Vitae's Privacy-Safe Durable Execution Substrate
decisionDate: "2026-08-20"
lastUpdated: "2026-08-20"
owners:
  - name: Vitae engineering owner
    role: decision owner
maturity: full
complexity: high
decisionScope:
  - architecture
  - workflow
  - security
  - operations
affectedSystems:
  - vitae
  - temporal
  - agent-workflows
  - babysitter
  - litellm
  - doc-vader
links:
  - label: System boundary ADR
    href: 0001-vitae-system-boundaries.md
    relationship: related
  - label: Canonical domain and workflow boundary ADR
    href: 0003-canonical-vitae-domain-and-workflow-boundary.md
    relationship: related
  - label: Temporal execution plan
    href: ../career/temporal-adoption-execution-plan.md
    relationship: implements
  - label: Temporal execution boundary and threat model
    href: ../career/temporal-execution-threat-model.md
    relationship: implements
  - label: Temporal documentation
    href: https://docs.temporal.io/workflows
    relationship: source
  - label: LangGraph persistence documentation
    href: https://docs.langchain.com/oss/javascript/langgraph/persistence
    relationship: source
  - label: Babysitter architecture
    href: https://github.com/a5c-ai/babysitter/blob/main/docs/user-guide/features/architecture-overview.md
    relationship: source
  - label: OpenClaw security model
    href: https://docs.openclaw.ai/gateway/security
    relationship: source
tags:
  - temporal
  - workflow-execution
  - privacy
  - durability
llm:
  purpose: Establish the durable execution boundary for Vitae while retaining Vitae ownership of career-domain policy, privacy controls, and user-facing approval decisions.
  canonicalQuestions:
    - What does Temporal own and explicitly not own?
    - What data may cross the Temporal boundary?
    - How are human approvals, retries, and auditability implemented without making Temporal a domain authority?
  readerHints:
    - Read before adding Temporal workers, clients, Activities, or workflow-triggering endpoints.
    - The execution plan defines the ordered implementation and security gates.
---

# ADR-0004: Adopt Temporal as Vitae's Privacy-Safe Durable Execution Substrate

## LLM Snapshot

- **Decision:** Vitae will directly integrate Temporal as its durable execution substrate; it will not route product execution through `agent-workflows`.
- **Boundary:** Vitae retains FastAPI, SQLModel, LiteLLM, canonical records, scoring, promotion policy, authorization, and approval UX. Temporal owns durable scheduling, retries, waits, cancellation, and resumability.
- **Privacy rule:** Only opaque IDs and minimal safe metadata may enter Temporal payloads, history, signals, search attributes, memo, logs, metrics, labels, diagnostics, or fixtures.
- **Watch for:** Any raw resume, JD, prompt, completion, secret, or reviewer prose crossing into Temporal is a stop condition.

## Status

Accepted.

## Context and Problem Statement

WI-022 defines durable product workflow contracts but deliberately provides no runtime. Vitae needs executions that can survive worker failure, wait for human review, retry safely, and preserve an auditable control flow. `agent-workflows` was originally considered for deterministic agentic code-factory work but has been superseded in that role by Babysitter. It is not a product-path dependency.

The decision evaluated: direct Temporal integration, LangGraph JS, Babysitter, OpenClaw, a pure TypeScript workflow engine, and retaining `agent-workflows`. User-confirmed weights were durability/HITL (30%), determinism/auditability (30%), operational simplicity (15%), AI integration (15%), and domain-semantic ownership (10%).

## Decision Drivers

- Durable, resumable execution and safe human waits.
- Deterministic replay, retry behavior, and auditable lifecycle control.
- Strict minimization of PII and confidential model material.
- Preserve Vitae ownership of canonical domain semantics and promotion policy.
- Keep AI-assisted stages behind LiteLLM and structured-output validation.
- Avoid reintroducing legacy product-path dependencies.

## Considered Options

| Option | Weighted assessment | Decision |
| --- | --- | --- |
| Temporal | Strong durability/HITL and deterministic orchestration; operational cost is explicit. | Chosen as substrate. |
| LangGraph JS | Strong bounded AI-stage integration and checkpointing, but does not replace durable product policy, audit, or security boundaries. | Optional inside an Activity only. |
| Babysitter | Appropriate for the deterministic engineering/code factory, not multi-tenant product workflow authority. | Retain outside product path. |
| OpenClaw | Useful agent/session tooling, not a product workflow authority. | Not selected. |
| Pure TypeScript engine | Simple initially but would recreate durability, retry, HITL, and audit infrastructure. | Not selected. |
| `agent-workflows` | Superseded for the code factory and mismatched to the product boundary. | Not selected. |

## Decision Outcome

Vitae directly integrates Temporal behind a Vitae-owned execution adapter. The adapter translates canonical `Workflow` and `WorkflowRun` transitions into Temporal execution; it does not delegate domain decisions.

- **Vitae/FastAPI/SQLModel:** identity, tenant authorization, canonical records, `WorkflowRun` state, `RuntimeExecution` ledger, read models, approval UI/API, and audit records.
- **Vitae services/LiteLLM:** parsing, scoring, structured model calls, source/evidence validation, and promotion guards.
- **Temporal:** durable orchestration, retries, task routing, cancellation, timers, and pause/resume mechanics.
- **Activities:** idempotent storage/database/model/notification integrations. They receive opaque references and emit validated, minimal result records.
- **Babysitter:** engineering/product factory execution only.
- **`agent-workflows`:** excluded from the Vitae product path.

### Privacy and safety boundary

Raw resume/JD text, prompts, model completions, secrets, and reviewer prose must not enter Temporal history or any Temporal-adjacent metadata surface. Vitae stores sensitive material in its authorized data boundary and passes opaque IDs plus minimal, allowlisted safe status metadata. Activities retrieve data only after tenant/actor authorization. Logging, metrics, diagnostics, fixtures, and search attributes use identifiers, counts, state, and approved codes only.

### Temporal limitations and bridges

| Temporal limitation | Vitae bridge |
| --- | --- |
| No career-domain semantics | Canonical schemas, services, and guards remain authoritative. |
| No approval UX or business authorization | Vitae approval endpoints validate actor/tenant/state, persist decisions, then signal execution. |
| At-least-once Activity execution | Idempotency keys, unique constraints, transactional outbox/inbox, and reconciliation. |
| Workflow replay/version evolution | Version-pinned workflow definitions, compatibility tests, and representative-history replay in CI. |
| Workflow history is not a reporting system | SQLModel read models and a safe RuntimeExecution ledger provide product status/audit views. |
| Payload/history retention risk | Opaque references, size limits, retention policies, and externally stored encrypted artifacts. |
| Operational footprint | A readiness gate selects Temporal Cloud versus self-hosting from cost, residency, support, recovery, and operations evidence; this ADR does not preselect either. |

## Consequences

- Good: long-running human review and retry behavior become durable without embedding an engine in FastAPI.
- Good: product semantics remain testable independently of Temporal.
- Good: Babysitter and product orchestration have non-overlapping responsibilities.
- Bad: workers, task queues, operational runbooks, versioning, and privacy controls become explicit platform work.
- Bad: every Activity requires idempotency and PII-boundary tests before use.
- Neutral: LangGraph may support a bounded AI Activity later, but cannot become the canonical workflow authority without a new ADR.

## Confirmation

- No sensitive content appears in Temporal payloads, histories, metadata, logs, metrics, diagnostics, or fixtures.
- Every Activity has idempotency/retry evidence and every human decision has Vitae authorization/audit evidence.
- Canonical guards decide Seed promotion, evidence validity, scoring, and Catalog publication before execution side effects.
- Temporal Cloud versus self-hosted selection remains blocked until WI-040 acceptance evidence is reviewed.

## Supersession

This ADR directly amends the execution portions of ADR-0001 and ADR-0003. Their canonical domain and supporting-system boundaries remain authoritative except that `agent-workflows` is no longer the intended Vitae execution adapter. Temporal is the durable substrate under a direct Vitae-owned adapter; Babysitter remains the code-factory tool.

## Related Work

- `backlog/027-adopt-privacy-safe-durable-temporal-execution.md`
- `backlog/028-define-temporal-execution-boundary-and-threat-model.md`
- `docs/career/temporal-adoption-execution-plan.md`
- `docs/career/temporal-execution-threat-model.md`
