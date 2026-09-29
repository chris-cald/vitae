# Local Pi OpenAI bridge

Development/UAT-only OpenAI-compatible bridge for using the locally authenticated `pi` CLI as Vitae's LiteLLM provider.

Run from the repo root:

```sh
PI_BRIDGE_API_KEY=local-pi-bridge \
PI_BRIDGE_MODEL="" \
uvicorn uat.pi_openai_bridge.pi_openai_bridge:app --host 127.0.0.1 --port 8787
```

Then set backend env:

```sh
LLM_MODEL=openai/pi-local
LITELLM_API_BASE=http://127.0.0.1:8787/v1
LITELLM_API_KEY=local-pi-bridge
```

Notes:

- Use only synthetic UAT material through this bridge.
- It shells out to `pi -p --no-session --no-tools --no-context-files --no-skills --no-extensions` so the app gets a model response without granting tool access.
- Bind to `127.0.0.1`; do not expose this bridge on a network.
- For Podman, run it on the host and point containers at `host.containers.internal:8787`, or run it in a container that has access to the same authenticated Pi config.
