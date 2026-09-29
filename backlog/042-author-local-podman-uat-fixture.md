---
id: wi-042
title: Author Local Podman Playwright Cucumber UAT Fixture
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 2
links:
  parent:
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
tags:
  - uat
  - playwright
  - podman
  - privacy
---

## Goal

Provide a local Playwright/Cucumber UAT fixture operators can run against Podman-hosted Vitae services to collect WI-040 technical evidence without committing private artifacts.

## Deliverables

- [x] Cucumber feature covering expanded MVP contract, RuntimeExecution start/decision/cancel, browser job-fit flow, Temporal history privacy, and canonical-vault no-write evidence.
- [x] Playwright step definitions using synthetic inputs, hashed vault inventory, and forbidden-history scanning.
- [x] README explaining local run commands, Pi provider limitation, and the remaining production adoption decision.
- [x] Static smoke test proving the fixture remains wired into frontend validation.

## Acceptance Criteria

- [x] Fixture files do not require app dependency changes.
- [x] Canonical vault inventory evidence exposes hashed relative paths only.
- [x] No committed UAT artifact contains real resume, job, provider, URL, filename, vault path, prompt, completion, or secret data.
- [x] WI-040 remains the owner of live evidence and production adoption sign-off.

## Test and Evidence

- `cd frontend && node --test test/uat-fixture-smoke.test.mjs`
- `node --check uat/playwright-cucumber/steps/mvp-expanded-uat.steps.mjs`
- `dv backlog validate --dir backlog --fail-on error`
