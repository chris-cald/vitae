import subprocess
import sys
from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from uat.pi_openai_bridge import pi_openai_bridge  # noqa: E402


def test_pi_bridge_exposes_openai_compatible_chat_completion(monkeypatch):
    def fake_run(command, **kwargs):
        assert command[:2] == ["pi", "--no-session"]
        assert "--no-tools" in command
        assert command[-2] == "--"
        assert "user: synthetic prompt" in command[-1]
        return SimpleNamespace(stdout='{"ok": true}\n')

    monkeypatch.setattr(pi_openai_bridge.subprocess, "run", fake_run)
    monkeypatch.setenv("PI_BRIDGE_API_KEY", "local-pi-bridge")

    response = TestClient(pi_openai_bridge.app).post(
        "/v1/chat/completions",
        headers={"authorization": "Bearer local-pi-bridge"},
        json={"model": "pi-local", "messages": [{"role": "user", "content": "synthetic prompt"}]},
    )

    assert response.status_code == 200
    assert response.json()["choices"][0]["message"]["content"] == '{"ok": true}'


def test_pi_bridge_hides_prompt_when_pi_call_fails(monkeypatch):
    def fail_run(command, **kwargs):
        raise subprocess.CalledProcessError(1, command, stderr="raw synthetic prompt")

    monkeypatch.setattr(pi_openai_bridge.subprocess, "run", fail_run)
    monkeypatch.setenv("PI_BRIDGE_API_KEY", "local-pi-bridge")

    response = TestClient(pi_openai_bridge.app).post(
        "/v1/chat/completions",
        headers={"authorization": "Bearer local-pi-bridge"},
        json={"messages": [{"role": "user", "content": "raw synthetic prompt"}]},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "pi-bridge-call-failed"}
    assert "raw synthetic prompt" not in response.text


def test_pi_bridge_rejects_missing_local_token(monkeypatch):
    monkeypatch.setenv("PI_BRIDGE_API_KEY", "local-pi-bridge")

    response = TestClient(pi_openai_bridge.app).post(
        "/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "synthetic prompt"}]},
    )

    assert response.status_code == 401
