import sys
import types

from src.services.utils import call_llm_stub


class _Message:
    content = '{"ok": true}'


class _Choice:
    message = _Message()


class _Response:
    choices = [_Choice()]


def test_call_llm_passes_optional_litellm_proxy_config(monkeypatch):
    calls = []

    def completion(**kwargs):
        calls.append(kwargs)
        return _Response()

    monkeypatch.setitem(sys.modules, "litellm", types.SimpleNamespace(completion=completion))
    monkeypatch.setenv("LLM_MODEL", "openai/pi-local")
    monkeypatch.setenv("LITELLM_API_BASE", "http://127.0.0.1:8787/v1")
    monkeypatch.setenv("LITELLM_API_KEY", "local-pi-bridge")

    assert call_llm_stub("synthetic prompt") == '{"ok": true}'

    assert calls == [
        {
            "model": "openai/pi-local",
            "messages": [{"role": "user", "content": "synthetic prompt"}],
            "api_base": "http://127.0.0.1:8787/v1",
            "api_key": "local-pi-bridge",
        }
    ]
