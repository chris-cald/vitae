---
id: wi-026
title: Track One Application With Lightweight Material Records
summary: Add or prototype lightweight Application tracking that links Target, Deliverables, notes, material status changes, and outcomes without requiring a record for every state change.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
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

- [x] Define the MVP Application shape and required links to Profile, Target, Deliverables, FitAnalysis, and notes.
- [x] Define ApplicationRecord subtypes and the durable-record threshold.
- [x] Create or implement one Application fixture or flow using outputs from `wi-025`.
- [x] Support material status updates and notes without modeling every change as a record.
- [x] Link outcome or follow-up records back to the Application.
- [x] Add focused validation or fixtures demonstrating the complete MVP loop.

## Deliverables

- Application tracking contract or implementation slice.
- ApplicationRecord examples for material events.
- End-to-end MVP fixture from Profile/BookOfWork through Application.

## Acceptance Criteria

- [x] One Application links Target, Deliverables, FitAnalysis, and material notes or records.
- [x] Durable records are created only for material events defined by ADR-0003.
- [x] Routine edits or internal state changes are not forced into user-facing records.
- [x] The end-to-end MVP loop can be reviewed from source material to application outcome.

## Completion notes

- The MVP UAT demo links one Application to its Target, Deliverables, and ApplicationRecord fixture.
- Focused validation lives in `backend/tests/test_mvp_application_loop_service.py` and API smoke coverage in `backend/tests/test_mvp_application_loop_api.py`.

## Relationships

- `depends_on`: `wi-025`
- `references`: `docs/prd/mvp-book-of-work-to-application-loop.md`, `docs/adr/0003-canonical-vitae-domain-and-workflow-boundary.md`
