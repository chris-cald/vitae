# Canonical MVP Planning Reconciliation

This note completes the planning reconciliation requested by `wi-019`. [ADR-0003](../adr/0003-canonical-vitae-domain-and-workflow-boundary.md) and the [MVP PRD](../prd/mvp-book-of-work-to-application-loop.md) are the scope authorities. Earlier documents remain useful boundary and provenance context, but they do not override the canonical vocabulary, adapter boundary, or MVP sequence.

## Scope notes for earlier planning

- `career-workflow-platform-boundaries.md` remains the long-range platform-boundary PRD. The expanded BookOfWork-to-Application MVP narrows it: deep external integrations remain deferred, but Temporal-backed durable execution and Book of Work refresh are now runtime prerequisites.
- ADR-0001 remains the supporting-system ownership decision. “Work Orders” are Doc-Vader governance artifacts, not a Vitae product-domain `WorkItem`.
- ADR-0002 remains the provenance direction. Its candidate graph nodes and edges are implementation guidance, not a persistence-authoritative product schema; MVP provenance begins with `SourceRef`, `Evidence`, and `Relationship`.

## Legacy backlog disposition

| Work item | Disposition | Canonical follow-up |
| --- | --- | --- |
| `wi-010` Career Artifact and Record Schema | Superseded | `wi-020` supplies the canonical model; `wi-026` owns lightweight material application records. |
| `wi-011` Provenance Fields | Rewrite after core model | Implement against `SourceRef`, `Evidence`, and `Relationship` after `wi-023` defines the fit slice. |
| `wi-012` Separate scoring/recommendations | Remains valid, deferred | Align with `FitAnalysis`, `Misalignment`, and `Recommendation`; schedule after `wi-023`/`wi-024`. |
| `wi-013` Career graph projection | Deferred | MVP uses contract fixtures first; persistent graph work is post-MVP or an explicit adapter slice. |
| `wi-014` Typed frontend/backend API | Remains valid, deferred | Derive API types from the canonical contracts when the first persistence/API slice is selected. |
| `wi-015` templjs rendering | Rewrite as implementation integration | `wi-020` now supplies templjs templates; runtime integration waits for `wi-025`. |
| `wi-016` Doc-Vader evidence records | Deferred | User-domain lifecycle governance remains MVP+1; application material records are owned by `wi-026`. |
| `wi-017` Agent Work Orders | Superseded for MVP | `Workflow`/`WorkflowRun` are product contracts; full Agent Workflows integration remains deferred. |
| `wi-018` ADR/PRD validation tooling | Remains valid, independent | It is SDLC governance and may proceed independently of product-domain implementation. |

## Resulting frontier

`wi-020` through `wi-026` define the canonical model and fixture-backed application loop. Full expanded MVP UAT is not complete until the Temporal runtime slices, multi-application state, Book of Work refresh, live provider/browser evidence, WI-040 readiness gate, and canonical-vault no-write evidence are complete. Deferred roadmap scope still includes typed API contracts, broader scoring/recommendation separation, full portfolio workflows, and user-domain lifecycle governance.
