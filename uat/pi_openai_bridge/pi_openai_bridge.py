from __future__ import annotations

import os
import logging
import subprocess
import time
import uuid
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, ConfigDict


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    model: str = "pi-local"
    messages: list[ChatMessage]
    stream: bool = False


logger = logging.getLogger(__name__)
app = FastAPI(title="Vitae local Pi OpenAI bridge")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/chat/completions")
def chat_completions(
    request: ChatCompletionRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _authorize(authorization)
    if request.stream:
        raise HTTPException(status_code=400, detail="streaming-not-supported")

    try:
        content = run_pi(build_prompt(request.messages))
    except subprocess.TimeoutExpired:
        logger.error("Pi bridge model call timed out")
        raise HTTPException(status_code=503, detail="pi-bridge-timeout")
    except subprocess.CalledProcessError:
        logger.error("Pi bridge model call failed")
        raise HTTPException(status_code=503, detail="pi-bridge-call-failed")
    return {
        "id": f"chatcmpl-{uuid.uuid4()}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": request.model,
        "choices": [
            {
                "index": 0,
                "finish_reason": "stop",
                "message": {"role": "assistant", "content": content},
            }
        ],
    }


def build_prompt(messages: list[ChatMessage]) -> str:
    return "\n\n".join(f"{message.role}: {message.content}" for message in messages)


def run_pi(prompt: str) -> str:
    command = [
        os.getenv("PI_BRIDGE_BIN", "pi"),
        "--no-session",
        "--no-tools",
        "--no-context-files",
        "--no-skills",
        "--no-extensions",
        "-p",
    ]
    if os.getenv("PI_BRIDGE_MODEL"):
        command[1:1] = ["--model", os.environ["PI_BRIDGE_MODEL"]]
    if os.getenv("PI_BRIDGE_PROVIDER"):
        command[1:1] = ["--provider", os.environ["PI_BRIDGE_PROVIDER"]]

    result = subprocess.run(
        [*command, "--", prompt],
        check=True,
        capture_output=True,
        text=True,
        timeout=int(os.getenv("PI_BRIDGE_TIMEOUT_SECONDS", "120")),
    )
    return result.stdout.strip()


def _authorize(authorization: str | None) -> None:
    expected = os.getenv("PI_BRIDGE_API_KEY")
    if expected and authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="unauthorized")
