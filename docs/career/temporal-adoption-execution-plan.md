# Temporal Adoption Execution Plan

## Purpose and authority

This plan executes [ADR-0004](../adr/0004-adopt-privacy-safe-temporal-execution-substrate.md) through [WI-027](../../backlog/027-adopt-privacy-safe-durable-temporal-execution.md). It is an implementation-management plan, not a runtime specification. Vitae owns canonical career-domain records, policy, scoring, promotion, authorization, and user-facing review. Temporal is a durable execution substrate only. `agent-workflows` is excluded from the product path; Babysitter remains the engineering/code-factory tool. ADR-0004 accepts Temporal as the selected durable substrate, and the expanded MVP makes durable Temporal execution MVP-blocking. WI-040 still owns Cloud-versus-self-hosted selection and production hardening evidence, but UAT no longer treats durable execution as optional or deferred.

## PII stop conditions

Stop the affected task immediately and open a security review if raw resume/JD text, prompt, model completion, secret, or reviewer prose appears in a Temporal payload, history, Signal, search attribute, memo, log, metric, label, diagnostic, or fixture. Do not redact after the fact and continue: remove the data, assess exposure/retention, and add a regression test before resuming.

Only opaque IDs, correlation IDs, approved status codes, bounded counts, schema/version identifiers, and minimal timing metadata may cross the execution boundary. Sensitive retrieval happens inside authorized Vitae Activities using tenant-scoped references.

## Phases and dependency order

| Phase | Work items | Primary role | Parallelism | Delivery gate |
| --- | --- | --- | --- | --- |
| 0: governance | WI-027, WI-028 | Engineering manager, security, operations | WI-028 precedes all runtime work | Threat model, payload allowlist, and operational review accepted. |
| 1: execution foundation | WI-029, WI-030, WI-031 | Backend/platform engineer, security reviewer | WI-029 follows WI-028; WI-030 follows WI-029; WI-031 follows both | Adapter rejects sensitive data; worker fails closed; ledger/API prove idempotency and tenant-safe status. |
| 2: human control | WI-033 | Backend engineer, product/security reviewer | After Phase 1; may run beside WI-034 | Authorized approval Signal, durable wait, duplicate/stale-decision, and redaction tests pass. |
| 3: catalog distillation | WI-034, WI-035, WI-036 | Backend engineer, domain reviewer | Harvest follows Phase 1; Cull/Prime follow Harvest + review bridge; Substantiate follows Cull/Prime + review bridge | Seed/Evidence/promotion guards run before effects; destructive Cull and publication require Vitae approval. |
| 4: MVP product adoption | WI-032, WI-037, WI-038, WI-039 | Product/backend teams | WI-032 follows Phase 1 + WI-009; WI-037–039 follow their existing product slices and Phase 1 | Durable job-fit, target/catalog fit, deliverable generation, and application automation paths are implemented for MVP UAT with evidence-backed scope cuts. |
| 5: readiness decision | WI-040 | Engineering manager, security, operations, decision owner | After required foundation/slice evidence | Recovery, replay, privacy, support, cost, retention, Cloud/self-hosted evidence, and canonical-vault no-write evidence reviewed; explicit production readiness decision recorded. |

## Roles and ownership

- **Engineering manager:** owns sequencing, dependency health, evidence review, and scope control.
- **Decision owner:** approves the production-adoption and Cloud-versus-self-hosted decision in WI-040.
- **Backend/platform engineer:** owns adapter, worker, ledger, Activities, operational runbooks, and TDD evidence.
- **Security/privacy reviewer:** approves threat model, payload contract, retention, authorization, and PII stop-condition resolution.
- **Domain/service owner:** confirms existing canonical guards—not Temporal—decide scoring, evidence, promotion, and publication.
- **Operations owner:** owns deployment, task-queue, backup/recovery, alerting, and on-call evidence.
- **Product reviewer:** owns approval wording/UX and validates that durable execution does not become an in-product WorkItem abstraction.

## Required evidence per runtime slice

Every worker, Activity, endpoint, and workflow change must supply:

1. focused tests first, including failure/retry/cancellation and idempotency behavior;
2. payload/log/metric/fixture assertions proving no prohibited material reaches Temporal;
3. authorization and tenant-isolation tests for all triggers, Signals, and status reads;
4. schema/guard evidence showing Vitae decides canonical state transitions before effects;
5. synthetic recovery/replay evidence for any workflow that can wait or retry;
6. updated safe operational documentation and rollback/reconciliation instructions.

## Scope constraints

- Keep the existing synchronous job-fit endpoint during WI-032; durable execution is added without deleting the synchronous fallback.
- Do not modify WI-023–026 completed contract/fixture evidence. Their runtime follow-through is now MVP-blocking through WI-037–039.
- UAT and Temporal Activities must not create, modify, delete, rename, or rewrite canonical files/catalog under `~/Obsidian Vaults/loft/1 Projects/Job Search/`; use read-only mounts, snapshots, or test storage.
- Do not put a raw document, prompt, completion, secret, or reviewer note into Temporal merely to simplify debugging or observability.
- Do not use Temporal visibility/history as Vitae’s canonical audit, application, evidence, or scoring store.
- Do not select Temporal Cloud or self-hosting before WI-040; assess data residency, security controls, cost, support ownership, recovery objectives, and operational maturity from evidence.

## Progression checklist

Advance to the next phase only when all prior items have passing focused validation, no unresolved PII stop condition, documented owner review, and Doc-Vader-valid dependency links. A failed privacy, authorization, idempotency, or replay test blocks progression regardless of functional success.
