import pytest

from src.services.temporal_config import TemporalWorkerConfig


def test_temporal_worker_config_fails_closed_without_address():
    with pytest.raises(ValueError, match="temporal-address-required"):
        TemporalWorkerConfig.from_env({})


def test_temporal_worker_config_rejects_identifying_queue_names():
    with pytest.raises(ValueError, match="unsafe-temporal-config"):
        TemporalWorkerConfig.from_env(
            {
                "TEMPORAL_ADDRESS": "localhost:7233",
                "TEMPORAL_NAMESPACE": "default",
                "TEMPORAL_TASK_QUEUE": "jane-resume-queue",
            }
        )


def test_temporal_worker_config_accepts_deployment_owned_names():
    config = TemporalWorkerConfig.from_env(
        {
            "TEMPORAL_ADDRESS": "localhost:7233",
            "TEMPORAL_NAMESPACE": "vitae-dev",
            "TEMPORAL_TASK_QUEUE": "vitae-orchestration",
        }
    )

    assert config.safe_summary() == {
        "namespace": "vitae-dev",
        "task_queue": "vitae-orchestration",
        "status_code": "configured",
    }
