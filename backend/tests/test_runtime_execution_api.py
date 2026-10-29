import asyncio
from uuid import uuid4

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient

from db.db import AsyncSessionLocal, init_db
from src.main import app
from src.models.runtime_execution import RuntimeExecution
from src.services.runtime_execution_service import RuntimeExecutionAuthority, RuntimeExecutionService


RUNTIME_HEADERS = {"Authorization": "Bearer runtime-test-token"}


@pytest.fixture(autouse=True)
def no_temporal_address(monkeypatch):
    monkeypatch.delenv("TEMPORAL_ADDRESS", raising=False)
    monkeypatch.setenv("RUNTIME_EXECUTION_AUTH_MODE", "dummy")
    monkeypatch.setenv("RUNTIME_EXECUTION_TOKEN", "runtime-test-token")
    monkeypatch.setenv("RUNTIME_EXECUTION_TENANT_KEY", "tenant_00000000-0000-4000-8000-000000000001")


@pytest.mark.asyncio
async def test_runtime_execution_accepts_a_verified_oidc_token_with_an_opaque_tenant_claim(monkeypatch):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = jwt.encode(
        {
            "sub": "runtime-operator",
            "iss": "https://auth.example/application/o/vitae/",
            "aud": "vitae-api",
            "exp": 4_102_444_800,
            "vitae_tenant": "tenant_00000000-0000-4000-8000-000000000001",
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "test-key"},
    )

    class Jwks:
        def __init__(self, _url):
            pass

        def get_signing_key_from_jwt(self, _token):
            return type("Key", (), {"key": private_key.public_key()})()

    monkeypatch.setattr("src.services.runtime_execution_service.jwt.PyJWKClient", Jwks)
    authority = await RuntimeExecutionAuthority.from_authorization_header(
        f"Bearer {token}",
        {
            "RUNTIME_EXECUTION_AUTH_MODE": "oidc",
            "RUNTIME_OIDC_ISSUER": "https://auth.example/application/o/vitae/",
            "RUNTIME_OIDC_AUDIENCE": "vitae-api",
            "RUNTIME_OIDC_JWKS_URL": "https://auth.example/application/o/vitae/jwks/",
            "RUNTIME_OIDC_TENANT_CLAIM": "vitae_tenant",
        },
    )

    assert authority.tenant_key == "tenant_00000000-0000-4000-8000-000000000001"


@pytest.mark.asyncio
async def test_concurrent_same_key_start_reserves_one_runtime_execution_before_adapter_start():
    await init_db()
    started = asyncio.Event()
    release = asyncio.Event()

    class BlockingAdapter:
        calls = 0

        async def start(self, _command):
            self.calls += 1
            started.set()
            await release.wait()

    service = RuntimeExecutionService(BlockingAdapter())
    authority = RuntimeExecutionAuthority("tenant_00000000-0000-4000-8000-000000000001")
    request = {"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"}
    first = asyncio.create_task(service.start(request, authority))
    await started.wait()
    second = asyncio.create_task(service.start(request, authority))
    try:
        await asyncio.sleep(0)
        assert service.adapter.calls == 1
    finally:
        release.set()
        results = await asyncio.gather(first, second, return_exceptions=True)

    assert not any(isinstance(result, Exception) for result in results)
    assert results[0][0].execution_id == results[1][0].execution_id
    assert sorted(result[1] for result in results) == [False, True]


def test_runtime_execution_start_and_human_decision_are_privacy_safe():
    idempotency_key = f"idem_{uuid4()}"
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
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
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
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
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
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

    with TestClient(app, headers=RUNTIME_HEADERS) as client:
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

    with TestClient(app, headers=RUNTIME_HEADERS) as client:
        for extra in cases:
            response = client.post(
                "/api/v1/runtime-executions",
                json={"workflow_type": "target-catalog-fit", **extra},
            )
            assert response.status_code == 422
            assert "person@example.test" not in response.text


def test_runtime_execution_rejects_pii_shaped_fields_before_temporal_boundary():
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
        response = client.post(
            "/api/v1/runtime-executions",
            json={
                "workflow_type": "target-catalog-fit",
                "resume_content": "candidate@example.test raw resume",
            },
        )

    assert response.status_code == 422
    assert "candidate@example.test" not in response.text


def test_runtime_execution_requires_authorization_before_it_creates_a_ledger():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"},
        )

    assert response.status_code == 401
    assert response.json() == {"detail": {"code": "runtime-authorization-required"}}


def test_runtime_execution_rejects_client_supplied_tenant_context():
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
        response = client.post(
            "/api/v1/runtime-executions",
            json={
                "workflow_type": "curation",
                "tenant_key": "tenant_00000000-0000-4000-8000-000000000002",
            },
        )

    assert response.status_code == 422
    assert response.json() == {"detail": {"code": "invalid-runtime-execution-request"}}


def test_runtime_execution_failure_status_cannot_receive_a_late_decision():
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
        started = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"},
        ).json()["execution"]

        async def mark_failed():
            async with AsyncSessionLocal() as session:
                execution = await session.get(RuntimeExecution, started["execution_id"])
                execution.status_code = "permanent-failure"
                session.add(execution)
                await session.commit()

        asyncio.run(mark_failed())
        response = client.post(
            f"/api/v1/runtime-executions/{started['execution_id']}/decision",
            json={"decision_code": "approve"},
        )

    assert response.status_code == 422
    assert response.json() == {"detail": {"code": "stale-execution-decision"}}
