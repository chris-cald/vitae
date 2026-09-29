---
id: wi-044
title: Add Local Compose Instance
status: completed
status_reason: accepted
priority: high
links:
  parent:
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
tags:
  - compose
  - local
  - temporal
---

## Goal

Provide a root local compose file that starts the Vitae MVP stack for operator demos and local verification.

## Deliverables

- [x] `compose.local.yml` starts Temporal, backend, worker, and frontend.
- [x] Backend uses the lightweight UAT image and a local SQLite database.
- [x] Schemas are mounted read-only and canonical vault mount is read-only.
- [x] Local instance is verified reachable.

## Test and Evidence

- `podman-compose -f compose.local.yml -p vitae-local up -d --build`
- `http://localhost:8000/api/v1/mvp/application-loop/demo` returned 200.
- `http://localhost:5173` returned 200.
- `http://localhost:8233` returned 200.
