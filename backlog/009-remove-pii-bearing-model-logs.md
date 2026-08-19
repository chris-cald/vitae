---
id: wi-009
title: Remove PII-Bearing Model Logs
summary: Remove or redact prompt, raw response, extracted content, and source-text logging from model and semantic-detection paths so Vitae honors its privacy invariants.
type: work-item
subtype: task
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 2
links:
  reference:
    - '[[../AGENTS]]'
    - '[[../docs/prd/career-workflow-platform-boundaries]]'
tags:
  - privacy
  - logging
  - ai-ml
  - backend
---

## Goal

Remove PII-bearing model logs from Vitae while preserving useful operational observability.

## Background

Vitae handles resumes, job descriptions, prompts, and model responses that can contain personal, confidential, or employer-sensitive information. Repository guidance already says not to log raw documents, prompts, model responses, secrets, or full extracted text. Current model utility and category-detection code should be reviewed for logs that violate this invariant.

## Tasks

- [ ] Inspect backend model-call, parsing, embedding, and category-detection paths for raw prompt, response, document, or extracted-content logging.
- [ ] Replace unsafe logs with PII-safe fields such as IDs, counts, provider/model name, duration, status, and bounded error codes.
- [ ] Add or update focused tests where practical to prevent accidental prompt/response logging.
- [ ] Document any remaining unavoidable diagnostic surface and why it is safe.

## Deliverables

- Updated backend logging behavior.
- Focused privacy regression coverage or documented reason coverage is impractical.
- Short handoff notes identifying reviewed files and residual risk.

## Acceptance Criteria

- [ ] No backend logs include raw resumes, job descriptions, prompts, full model responses, or extracted content snippets.
- [ ] Operational logs still include enough non-sensitive metadata to diagnose failures.
- [ ] Privacy invariant is covered by a test, lint check, or explicit review checklist.
- [ ] Relevant backend tests or focused validation pass.

## Relationships

- `depends_on`: none
- `references`: `docs/prd/career-workflow-platform-boundaries.md`

