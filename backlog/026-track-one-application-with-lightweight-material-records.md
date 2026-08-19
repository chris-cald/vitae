---
id: wi-026
title: Track One Application With Lightweight Material Records
summary: Add or prototype lightweight Application tracking that links Target, Deliverables, notes, material status changes, and outcomes without requiring a record for every state change.
type: work-item
subtype: story
lifecycle: active
status: proposed
status_reason: blocked
priority: medium
estimated: 5
links:
  depends_on:
    - '[[025-generate-source-backed-resume-and-communication-deliverables]]'
  reference:
    - '[[../docs/prd/mvp-book-of-work-to-application-loop]]'
    - '[[../docs/adr/0003-canonical-vitae-domain-and-workflow-boundary]]'
tags:
  - mvp
  - applications
  - records
  - tracking
---

## Goal

Complete the MVP loop by tracking one Application with its Target, Deliverables, notes, material events, and outcome.

## Background

Application tracking is in scope for MVP, but it should remain lightweight. Durable ApplicationRecords should be reserved for material user-facing events such as submission, interview, decision, follow-up, important note, or outcome. Autosaves, routine field edits, sync updates, and recalculations should remain ordinary state or telemetry.

## Tasks

- [ ] Define the MVP Application shape and required links to Profile, Target, Deliverables, FitAnalysis, and notes.
- [ ] Define ApplicationRecord subtypes and the durable-record threshold.
- [ ] Create or implement one Application fixture or flow using outputs from `wi-025`.
- [ ] Support material status updates and notes without modeling every change as a record.
- [ ] Link outcome or follow-up records back to the Application.
- [ ] Add focused validation or fixtures demonstrating the complete MVP loop.

## Deliverables

- Application tracking contract or implementation slice.
- ApplicationRecord examples for material events.
- End-to-end MVP fixture from Profile/BookOfWork through Application.

## Acceptance Criteria

- [ ] One Application links Target, Deliverables, FitAnalysis, and material notes or records.
- [ ] Durable records are created only for material events defined by ADR-0003.
- [ ] Routine edits or internal state changes are not forced into user-facing records.
- [ ] The end-to-end MVP loop can be reviewed from source material to application outcome.

## Relationships

- `depends_on`: `wi-025`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
