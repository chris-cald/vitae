from uuid import uuid4

from fastapi.testclient import TestClient

from src.main import app


def test_runtime_execution_start_and_human_decision_are_privacy_safe():
    idempotency_key = f"idem_{uuid4()}"
    with TestClient(app) as client:
        start = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "target-catalog-fit", "idempotency_key": idempotency_key},
        )
        assert start.status_code == 201
        execution = start.json()["execution"]
        assert execution["status_code"] == "accepted"
        assert execution["workflow_type"] == "target-catalog-fit"
        assert "payload" not in execution
        assert "tenant_key" not in execution
        assert "workflow_definition_id" not in execution
        assert "workflow_run_id" not in execution
        assert "correlation_id" not in execution
        assert "idempotency_key" not in execution

        duplicate = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "target-catalog-fit", "idempotency_key": idempotency_key},
        )
        assert duplicate.status_code == 200
        assert start.json()["created"] is True
        assert duplicate.json()["created"] is False
        assert duplicate.json()["execution"]["execution_id"] == execution["execution_id"]
        assert duplicate.json()["execution"]["status_code"] == "accepted"

        decision = client.post(
            f"/api/v1/runtime-executions/{execution['execution_id']}/decision",
            json={"decision_code": "approve"},
        )
        assert decision.status_code == 200
        assert decision.json()["execution"]["status_code"] == "completed"


def test_runtime_execution_reject_maps_to_rejected_and_terminal_state_is_stale():
    with TestClient(app) as client:
        start = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"},
        )
        execution_id = start.json()["execution"]["execution_id"]

        reject = client.post(
            f"/api/v1/runtime-executions/{execution_id}/decision",
            json={"decision_code": "reject"},
        )
        stale = client.post(f"/api/v1/runtime-executions/{execution_id}/cancel")

    assert reject.status_code == 200
    assert reject.json()["execution"]["status_code"] == "rejected"
    assert stale.status_code == 422


def test_runtime_execution_can_be_cancelled_without_temporal_payload_leakage():
    with TestClient(app) as client:
        start = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "application-automation", "idempotency_key": f"idem_{uuid4()}"},
        )
        execution_id = start.json()["execution"]["execution_id"]

        cancel = client.post(f"/api/v1/runtime-executions/{execution_id}/cancel")

    assert cancel.status_code == 200
    body = cancel.json()["execution"]
    assert body["status_code"] == "cancelled"
    assert "payload" not in body


def test_runtime_execution_supports_required_expanded_mvp_workflow_types():
    workflow_types = [
        "book-of-work-refresh",
        "curation",
        "target-catalog-fit",
        "deliverable-generation",
        "application-automation",
    ]

    with TestClient(app) as client:
        for workflow_type in workflow_types:
            response = client.post(
                "/api/v1/runtime-executions",
                json={"workflow_type": workflow_type, "idempotency_key": f"idem_{uuid4()}"},
            )
            assert response.status_code == 201
            assert response.json()["execution"]["workflow_type"] == workflow_type


def test_runtime_execution_rejects_invalid_allowed_ids_safely():
    cases = [
        {"idempotency_key": "person@example.test"},
        {"tenant_key": "person@example.test"},
        {"correlation_id": "person@example.test"},
        {"idempotency_key": ""},
    ]

    with TestClient(app) as client:
        for extra in cases:
            response = client.post(
                "/api/v1/runtime-executions",
                json={"workflow_type": "target-catalog-fit", **extra},
            )
            assert response.status_code == 422
            assert "person@example.test" not in response.text


def test_runtime_execution_rejects_pii_shaped_fields_before_temporal_boundary():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/runtime-executions",
            json={
                "workflow_type": "target-catalog-fit",
                "resume_content": "candidate@example.test raw resume",
            },
        )

    assert response.status_code == 422
    assert "candidate@example.test" not in response.text
