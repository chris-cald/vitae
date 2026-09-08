# Research: ADR briefing — Temporal underpinning Vitae

## Summary
**Decision: adopt Temporal as the durable orchestration substrate for new long-running, approval-gated Vitae workflows; retain FastAPI, SQLModel, and LiteLLM services as the domain/API and AI execution layers.** This is the best fit for the stated priorities—durability/HITL (30) and determinism/auditability (30) dominate—and it does not require replacing the existing Python backend. It does add a managed-service or self-hosting operational cost, which is acceptable only if the controls below are implemented before processing production resume data.

## Context and hard constraints
- Vitae is currently a local React + FastAPI/SQLModel application. Its implemented flow is resume/job ingestion and job-fit analysis; LiteLLM is the provider seam. The roadmap is not proof of a current agent/workflow runtime. [Vitae README](/Users/macos/dev/vitae/README.md)
- Resume and job text is sensitive PII/confidential employer data. Current project rules prohibit logging raw documents, prompts, model responses, secrets, or full extracted text. [Vitae README](/Users/macos/dev/vitae/README.md)
- Preserve the existing thin-router/service architecture, provider flexibility, structured-output validation, and transparent requirement-to-evidence results. The workflow engine must orchestrate; it must not become a second scoring or persistence domain model. [Backend guide](/Users/macos/dev/vitae/backend/AGENTS.md)
- AI output is intrinsically non-deterministic. Deterministic orchestration means replaying the same ordered orchestration decisions from recorded inputs/results—not claiming that a fresh model call returns identical text.

## Weighted assessment
Scores are ADR judgments (1 poor–5 strong) against the supplied weights; they are not vendor benchmark results. “Semantics” means fit with Vitae’s explicit, reviewable domain states and requirement/evidence contract.

| Alternative | Durability/HITL 30 | Determinism/audit 30 | Operations 15 | AI integration 15 | Semantics 10 | Weighted / 5 | Decision |
|---|---:|---:|---:|---:|---:|---:|---|
| Legacy `agent-workflows` | 3 | 3 | 4 | 4 | 3 | 3.25 | Retain only as a local/prototyping reference |
| Babysitter | 3 | 3 | 3 | 4 | 2 | 3.05 | Reject for product workflow runtime |
| Pure TypeScript | 1 | 2 | 5 | 3 | 3 | 2.55 | Reject |
| LangGraph | 4 | 3 | 4 | 5 | 4 | 3.85 | Viable AI-layer alternative, not selected substrate |
| OpenClaw/Lobster | 2 | 2 | 3 | 4 | 2 | 2.50 | Reject |
| **Temporal (Python SDK)** | **5** | **5** | **3** | **4** | **5** | **4.55** | **Adopt** |

## Findings
1. **Temporal directly supplies the two highest-weight capabilities.** Workflow event history enables replay/durable recovery; Workflow definitions must make the same sequence of Workflow API calls for the same inputs. Its approval pattern blocks durably and resumes on a Signal, and Python supports Signals, Queries, and Updates. [Workflow definition](https://docs.temporal.io/workflow-definition) · [Approval pattern](https://docs.temporal.io/design-patterns/approval) · [Python messages](https://docs.temporal.io/develop/python/workflows/message-passing)
2. **Temporal is compatible with, rather than a replacement for, Vitae.** Use Python Workers beside the FastAPI backend. Workflows coordinate durable state machines; Activities call existing parsing, persistence, LiteLLM, and notification services. Temporal defines Activities as normal functions for external work such as database and third-party API calls. [Python Activity basics](https://docs.temporal.io/develop/python/activities/basics)
3. **Temporal imposes real design and operations obligations.** Workflow code must be replay-safe; code evolution needs patching/worker versioning discipline. Self-hosting requires persistence, visibility, monitoring, capacity/load testing, and operations ownership. Temporal Cloud reduces platform operations but still stores workflow history, so payload handling is a privacy design concern. [TypeScript versioning concepts](https://docs.temporal.io/develop/typescript/workflows/versioning) · [Self-hosted production checklist](https://docs.temporal.io/self-hosted-guide/production-checklist) · [Cloud overview](https://docs.temporal.io/cloud/overview)
4. **PII can be protected, but not by accident.** Temporal persists workflow/activity inputs, outputs, and results; its documented Payload Codec encrypts payloads before they reach the service. This is mandatory if any sensitive payload cannot be reduced to an opaque ID. [Codecs and encryption](https://docs.temporal.io/production-deployment/data-encryption)
5. **The alternatives solve narrower or different problems.** The legacy `agent-workflows` project advertises a SQLite journal/resume model, Babysitter is an AI-coding-harness orchestration product, and OpenClaw Lobster is a local typed workflow shell with approval gates. They may help local agent development, but none is an evidenced fit for Vitae’s production Python/API/data boundary. [agent-workflows](https://github.com/akakabrian/agent-workflows) · [Babysitter](https://github.com/a5c-ai/babysitter) · [OpenClaw Lobster](https://github.com/openclaw/lobster)
6. **LangGraph is the strongest runner-up for agent composition, not the preferred system of record.** Its persistence/checkpointing and interrupts support pause/resume/HITL, but the proposed decision favors Temporal’s event-history/replay model and operational control as the durable business-process substrate. LangGraph can later run *inside an Activity* where graph/agent composition adds value; it must not own approval truth or final analysis state. [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/durable-execution) · [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)

## Exact bridge and control requirements

### 1. Boundary and ownership
- **FastAPI remains ingress and authorization; Temporal is never browser-accessible.** The API authenticates/authorizes every command, validates request schema, creates/looks up the Vitae analysis record, and returns a product-facing `analysis_id` plus status.
- **Use a transactional outbox bridge.** In the same SQL transaction that creates/changes the domain command, write an outbox row. A dispatcher starts or signals Temporal after commit, with retry and a stable idempotency key. Do not rely on a best-effort HTTP call from the request handler.
- **Stable identity:** `workflow_id = "job-fit:{analysis_id}"`; use a supplied command/decision UUID for de-duplication. Persist Temporal `workflow_id`, `run_id`, workflow type/version, and last observed status on the analysis/run record. Never use a resume filename, email, or document text as an ID.
- **Temporal owns orchestration state; SQLModel owns business records.** A workflow may record stage, attempts, hashes, artifact IDs, and approval state. The canonical resume, job, requirement mappings, scores, feedback, and reviewer decision remain versioned domain data in Vitae’s database.

### 2. Activity and determinism rules
- Workflow code may only contain deterministic state transitions, Temporal timers, child-workflow calls, and message handlers. It must not perform HTTP/database/filesystem calls, use ordinary wall-clock time/randomness, call LiteLLM, read environment/configuration, or mutate shared state.
- Put document retrieval, parsing, LLM calls, schema validation, DB writes, notifications, and audit emission in Activities. Every mutating Activity requires an idempotency key (`analysis_id`, stage, input/artifact version, attempt/command ID), bounded retries, explicit start-to-close and schedule-to-close timeouts, and heartbeats for long work.
- Persist and return an immutable artifact/version ID plus input/model/prompt/template/schema identifiers and content hash from each AI Activity. Validate structured output before promotion. A retry must reuse a completed artifact/result where possible; it must not silently generate a second “same” analysis.
- Pin workflow code versions and use Temporal’s versioning/patch mechanism for any replay-visible workflow change. Maintain replay tests against representative completed histories before deployment. [Temporal versioning](https://docs.temporal.io/develop/typescript/workflows/versioning)

### 3. HITL controls
- Model explicit states: `QUEUED → PARSING → ANALYZING → AWAITING_REVIEW → APPROVED|REJECTED|EXPIRED|CANCELLED|FAILED`; transitions are append-only and carry actor, timestamp, reason, artifact/version, and correlation ID.
- The reviewer UI calls FastAPI; FastAPI re-authorizes the reviewer against the analysis/tenant and sends a typed Temporal **Signal** (`review_decision`) containing only decision metadata and an opaque decision/artifact ID. A Workflow **Query** supplies read-only progress. Use an **Update** only where the caller needs synchronous validation/acknowledgment. [Temporal messaging](https://docs.temporal.io/sending-messages)
- Signals are not authorization. Reject duplicate, stale, wrong-artifact, expired, or invalid-state decisions in the API and again in the Workflow state machine. Decisions must be immutable; correction is a new superseding decision with a reason.
- Set a durable review deadline/timer and named resolution: expire/escalate/cancel rather than leaving an unbounded wait. Support explicit cancellation and ensure downstream Activities honor cancellation.
- No model-initiated external publication, destructive write, or final user-facing recommendation may occur before the relevant approval gate when policy requires it.

### 4. Privacy, audit, and operations controls
- Pass opaque document/artifact IDs and minimal derived metadata in workflow inputs/history. Fetch raw text only inside an authorized Activity. Do not put raw resumes, job descriptions, prompts, completions, OAuth/API secrets, or reviewer free text in workflow inputs, Signals, search attributes, memo fields, logs, metrics, or Temporal UI-visible labels.
- Use a Payload Codec/client-side encryption for any unavoidable sensitive Temporal payload; separate keys and access, and restrict decoding/UI access. Use tenant/environment namespaces and mTLS/API-key least privilege if using Cloud. [Encryption](https://docs.temporal.io/production-deployment/data-encryption) · [Cloud security](https://docs.temporal.io/cloud/security)
- Emit a PII-safe application audit receipt for every domain transition: actor/service identity, authorization outcome, workflow/run IDs, command/decision ID, artifact hash/version, code+prompt+model versions, timestamps, and outcome/error class—not raw content. Retain it according to product policy independently of Temporal history retention.
- Establish retention/archival/deletion policy before launch. A user deletion request must delete/redact canonical artifacts and make encrypted Temporal payloads unrecoverable per policy; do not claim a workflow-history delete alone erases copies.
- Prefer Temporal Cloud for the first production release unless a documented data-residency/control requirement mandates self-hosting. For either choice, define namespace isolation, worker autoscaling/concurrency, dead-letter/failed-run triage, alerting, history-size/continue-as-new policy, backup/restore, incident runbooks, and cost/capacity limits. Self-hosting additionally owns persistence, visibility, and service/SDK metrics. [Self-hosted guide](https://docs.temporal.io/self-hosted-guide)

## Consequences
- **Positive:** crash/restart survival, durable approval waits, clear review/cancel semantics, replayable orchestration history, and a testable audit trail without coupling the UI to an agent session.
- **Negative:** a new platform, worker deployment/versioning discipline, activity idempotency work, data-retention/privacy engineering, and observability/cost overhead.
- **Scope guard:** introduce Temporal first for a single high-value workflow—e.g., parse → validate → analyze → human approve → publish feedback—behind a feature flag. Keep current synchronous job-fit behavior as fallback until bridge, replay, cancellation, and PII tests are proven.

## Sources
- **Kept:** Vitae README (/Users/macos/dev/vitae/README.md) — current architecture, product scope, and privacy invariants.
- **Kept:** Backend guide (/Users/macos/dev/vitae/backend/AGENTS.md) — service/router and validation constraints.
- **Kept:** Temporal official workflow, approval, Python SDK, encryption, security, and operations documentation (links above) — primary evidence for the recommendation and controls.
- **Kept:** LangGraph official durable-execution/interrupt documentation (links above) — strongest alternative’s documented capability.
- **Kept:** agent-workflows, Babysitter, and OpenClaw repositories (links above) — primary project descriptions for the named alternatives.
- **Dropped:** generic comparison articles and unverified plugin claims — not primary evidence and insufficient for an ADR.

## Gaps
- No present repository ADR, deployment topology, tenant model, data-retention policy, workload volume/SLO, or cloud/data-residency requirement was found in the reviewed project docs. Those inputs determine Cloud vs self-hosting, namespace design, retention, worker sizing, and the final cost estimate.
- The exact legacy `agent-workflows` version/deployment intended by the task is not identified in Vitae documentation; this briefing evaluates the public project bearing that name. Confirm its repository/version before treating the comparison as a migration assessment.
