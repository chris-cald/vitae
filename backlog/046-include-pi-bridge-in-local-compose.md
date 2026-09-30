---
id: wi-046
title: Include Pi Bridge in Local Compose
type: work-item
subtype: task
lifecycle: active
status: completed
status_reason: accepted
priority: high
links:
  parent:
    - '[[044-add-local-compose-instance]]'
tags:
  - compose
  - provider
  - pi
---

## Goal

Run the local OpenAI-compatible Pi bridge as part of the local compose stack instead of requiring a separate host process.

## Deliverables

- [x] Add `pi-bridge` service to `compose.local.yml`.
- [x] Build a Node/Python bridge image that can run the Pi CLI in-container.
- [x] Mount local Pi config into the bridge container for local authenticated use.
- [x] Point backend LiteLLM calls at `http://pi-bridge:8787/v1`.
- [x] Hide prompt details if bridge model invocation fails.

## Evidence

- `podman exec vitae-local_pi-bridge_1 pi auth check --provider openai-codex --json` reported ready.
- `POST http://localhost:8787/v1/chat/completions` returned 200 with `ok`.
- Resume upload through the running compose backend returned 200.
- Focused provider/upload/privacy tests passed.
