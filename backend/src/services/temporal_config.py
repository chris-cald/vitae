from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

_FORBIDDEN_NAME_PARTS = (
    "resume",
    "candidate",
    "job-description",
    "job_description",
    "jane",
    "email",
    "vault",
    "catalog",
    "source",
    "url",
    "filename",
)


@dataclass(frozen=True)
class TemporalWorkerConfig:
    address: str
    namespace: str
    task_queue: str

    @classmethod
    def from_env(cls, env: Mapping[str, str]) -> "TemporalWorkerConfig":
        address = env.get("TEMPORAL_ADDRESS")
        if not address:
            raise ValueError("temporal-address-required")
        config = cls(
            address=address,
            namespace=env.get("TEMPORAL_NAMESPACE", "vitae-dev"),
            task_queue=env.get("TEMPORAL_TASK_QUEUE", "vitae-orchestration"),
        )
        config._validate_safe_names()
        return config

    def safe_summary(self) -> dict[str, str]:
        return {
            "namespace": self.namespace,
            "task_queue": self.task_queue,
            "status_code": "configured",
        }

    def _validate_safe_names(self) -> None:
        joined = f"{self.namespace} {self.task_queue}".lower()
        if any(part in joined for part in _FORBIDDEN_NAME_PARTS):
            raise ValueError("unsafe-temporal-config")
