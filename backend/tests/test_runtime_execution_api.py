import asyncio
from uuid import uuid4

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlmodel import select

from db.db import AsyncSessionLocal, init_db
from src.main import app
from src.models.runtime_execution import RuntimeExecution
from src.services.runtime_execution_contract import RuntimeContractError
from src.services.runtime_execution_service import RuntimeExecutionAuthority, RuntimeExecutionService


RUNTIME_HEADERS = {"Authorization": "Bearer runtime-test-token"}


@pytest.fixture(autouse=True)
def no_temporal_address(monkeypatch):
    monkeypatch.delenv("TEMPORAL_ADDRESS", raising=False)
    monkeypatch.setenv("RUNTIME_EXECUTION_AUTH_MODE", "dummy")
    monkeypatch.setenv("RUNTIME_EXECUTION_TOKEN", "runtime-test-token")
    monkeypatch.setenv("RUNTIME_EXECUTION_TENANT_KEY", "tenant_00000000-0000-4000-8000-000000000001")
    monkeypatch.setenv("RUNTIME_EXECUTION_ACTOR_KEY", "actor_00000000-0000-4000-8000-000000000001")
    monkeypatch.setenv("RUNTIME_EXECUTION_ALLOWED_WORKFLOWS", "*")


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
            "sub": "actor_00000000-0000-4000-8000-000000000001",
            "vitae_runtime_workflows": ["curation"],
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "test-key"},
    )

    class Jwks:
        def __init__(self, _url, **_kwargs):
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
            "RUNTIME_OIDC_ACTOR_CLAIM": "sub",
            "RUNTIME_OIDC_WORKFLOW_CLAIM": "vitae_runtime_workflows",
        },
    )

    assert authority.tenant_key == "tenant_00000000-0000-4000-8000-000000000001"
    assert authority.actor_key == "actor_00000000-0000-4000-8000-000000000001"


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
    authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"curation"}),
    )
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
        assert "dispatch_attempt" not in execution

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
    assert stale.status_code == 409


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

    assert response.status_code == 409
    assert response.json() == {"detail": {"code": "stale-execution-decision"}}


@pytest.mark.asyncio
async def test_runtime_start_rejects_an_unauthorized_actor_before_reservation():
    await init_db()
    service = RuntimeExecutionService()
    authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"curation"}),
    )
    idempotency_key = f"idem_{uuid4()}"

    with pytest.raises(Exception, match="runtime-authorization-denied"):
        await service.start(
            {"workflow_type": "application-automation", "idempotency_key": idempotency_key},
            authority,
        )

    async with AsyncSessionLocal() as session:
        assert (
            await session.execute(
                select(RuntimeExecution).where(RuntimeExecution.idempotency_key == idempotency_key)
            )
        ).scalars().first() is None


@pytest.mark.asyncio
async def test_oidc_reuses_a_bounded_jwks_client_for_the_same_url(monkeypatch):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = jwt.encode(
        {
            "sub": "actor_00000000-0000-4000-8000-000000000001",
            "iss": "https://auth.example/cache/",
            "aud": "vitae-api",
            "exp": 4_102_444_800,
            "vitae_tenant": "tenant_00000000-0000-4000-8000-000000000001",
            "vitae_runtime_workflows": ["curation"],
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "cache-key"},
    )
    calls = 0

    class Jwks:
        def __init__(self, _url, **_kwargs):
            nonlocal calls
            calls += 1

        def get_signing_key_from_jwt(self, _token):
            return type("Key", (), {"key": private_key.public_key()})()

    monkeypatch.setattr("src.services.runtime_execution_service.jwt.PyJWKClient", Jwks)
    env = {
        "RUNTIME_EXECUTION_AUTH_MODE": "oidc",
        "RUNTIME_OIDC_ISSUER": "https://auth.example/cache/",
        "RUNTIME_OIDC_AUDIENCE": "vitae-api",
        "RUNTIME_OIDC_JWKS_URL": "https://auth.example/cache/jwks/",
    }

    await RuntimeExecutionAuthority.from_authorization_header(f"Bearer {token}", env)
    await RuntimeExecutionAuthority.from_authorization_header(f"Bearer {token}", env)

    assert calls == 1


@pytest.mark.asyncio
async def test_oidc_jwks_client_cache_evicts_the_oldest_url(monkeypatch):
    from src.services import runtime_execution_service

    runtime_execution_service._jwks_clients.clear()
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = jwt.encode(
        {
            "sub": "actor_00000000-0000-4000-8000-000000000001",
            "iss": "https://auth.example/bounded/",
            "aud": "vitae-api",
            "exp": 4_102_444_800,
            "vitae_tenant": "tenant_00000000-0000-4000-8000-000000000001",
            "vitae_runtime_workflows": ["curation"],
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "bounded-key"},
    )
    calls = 0

    class Jwks:
        def __init__(self, _url, **_kwargs):
            nonlocal calls
            calls += 1

        def get_signing_key_from_jwt(self, _token):
            return type("Key", (), {"key": private_key.public_key()})()

    monkeypatch.setattr("src.services.runtime_execution_service.jwt.PyJWKClient", Jwks)
    for index in range(9):
        await RuntimeExecutionAuthority.from_authorization_header(
            f"Bearer {token}",
            {
                "RUNTIME_EXECUTION_AUTH_MODE": "oidc",
                "RUNTIME_OIDC_ISSUER": "https://auth.example/bounded/",
                "RUNTIME_OIDC_AUDIENCE": "vitae-api",
                "RUNTIME_OIDC_JWKS_URL": f"https://auth.example/bounded/{index}/jwks/",
            },
        )
    await RuntimeExecutionAuthority.from_authorization_header(
        f"Bearer {token}",
        {
            "RUNTIME_EXECUTION_AUTH_MODE": "oidc",
            "RUNTIME_OIDC_ISSUER": "https://auth.example/bounded/",
            "RUNTIME_OIDC_AUDIENCE": "vitae-api",
            "RUNTIME_OIDC_JWKS_URL": "https://auth.example/bounded/0/jwks/",
        },
    )

    assert calls == 10
    assert len(runtime_execution_service._jwks_clients) == 8


@pytest.mark.asyncio
async def test_stale_dispatching_reservation_is_reconciled_on_same_key_retry():
    await init_db()

    class CountingAdapter:
        calls = 0

        async def start(self, _command):
            self.calls += 1

    service = RuntimeExecutionService()
    authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"curation"}),
    )
    request = {"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"}
    execution, _ = await service.start(request, authority)
    async with AsyncSessionLocal() as session:
        persisted = await session.get(RuntimeExecution, execution.execution_id)
        naive_stale_time = persisted.updated_at.replace(
            year=persisted.updated_at.year - 1, tzinfo=None
        ).isoformat(sep=" ")
        await session.execute(
            text(
                "UPDATE runtimeexecution SET status_code = 'dispatching', updated_at = :updated_at "
                "WHERE execution_id = :execution_id"
            ),
            {"updated_at": naive_stale_time, "execution_id": execution.execution_id},
        )
        await session.commit()

    service.adapter = CountingAdapter()
    recovered, created = await service.start(request, authority)

    assert created is False
    assert recovered.status_code == "accepted"
    assert service.adapter.calls == 1


@pytest.mark.asyncio
async def test_same_key_retries_a_recoverable_adapter_failure_without_new_execution(caplog):
    await init_db()

    class FlakyAdapter:
        calls = 0

        async def start(self, _command):
            self.calls += 1
            if self.calls == 1:
                raise RuntimeError("candidate@example.test protected resume content")

    service = RuntimeExecutionService(FlakyAdapter())
    authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"curation"}),
    )
    request = {"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"}

    with pytest.raises(Exception, match="runtime-start-failed"):
        await service.start(request, authority)
    recovered, created = await service.start(request, authority)

    assert created is False
    assert recovered.status_code == "accepted"
    assert service.adapter.calls == 2
    assert "candidate@example.test" not in caplog.text
    assert "runtime adapter dispatch failed" in caplog.text


@pytest.mark.asyncio
async def test_runtime_execution_rejects_non_ascii_dummy_bearer_safely():
    with pytest.raises(RuntimeContractError, match="runtime-authorization-denied"):
        await RuntimeExecutionAuthority.from_authorization_header(
            "Bearer café",
            {
                "RUNTIME_EXECUTION_AUTH_MODE": "dummy",
                "RUNTIME_EXECUTION_TOKEN": "runtime-test-token",
                "RUNTIME_EXECUTION_TENANT_KEY": "tenant_00000000-0000-4000-8000-000000000001",
                "RUNTIME_EXECUTION_ACTOR_KEY": "actor_00000000-0000-4000-8000-000000000001",
                "RUNTIME_EXECUTION_ALLOWED_WORKFLOWS": "curation",
            },
        )


@pytest.mark.asyncio
async def test_idempotency_reauthorizes_the_stored_workflow_type():
    await init_db()
    service = RuntimeExecutionService()
    full_authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"application-automation", "curation"}),
    )
    restricted_authority = RuntimeExecutionAuthority(
        full_authority.tenant_key,
        full_authority.actor_key,
        frozenset({"curation"}),
    )
    idempotency_key = f"idem_{uuid4()}"
    await service.start(
        {"workflow_type": "application-automation", "idempotency_key": idempotency_key},
        full_authority,
    )

    with pytest.raises(RuntimeContractError, match="runtime-authorization-denied"):
        await service.start(
            {"workflow_type": "curation", "idempotency_key": idempotency_key},
            restricted_authority,
        )


@pytest.mark.asyncio
@pytest.mark.parametrize(("decision", "expected_status"), [("cancel", "cancelled"), ("reject", "rejected")])
async def test_late_dispatch_cannot_overwrite_terminal_decision(decision, expected_status):
    await init_db()
    started = asyncio.Event()
    release = asyncio.Event()

    class BlockingAdapter:
        async def start(self, _command):
            started.set()
            await release.wait()

        async def signal(self, _command):
            return None

    service = RuntimeExecutionService(BlockingAdapter())
    authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"curation"}),
    )
    request = {"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"}
    task = asyncio.create_task(service.start(request, authority))
    await started.wait()
    async with AsyncSessionLocal() as session:
        execution = (
            await session.execute(
                select(RuntimeExecution).where(RuntimeExecution.idempotency_key == request["idempotency_key"])
            )
        ).scalars().one()
    if decision == "cancel":
        await service.cancel(execution.execution_id, authority)
    else:
        await service.record_decision(execution.execution_id, decision, authority)
    release.set()
    result, _ = await task

    assert result.status_code == expected_status


@pytest.mark.asyncio
async def test_reclaimed_dispatch_attempt_cannot_be_overwritten_by_an_older_attempt():
    await init_db()
    first_started = asyncio.Event()
    release_first = asyncio.Event()

    class ReclaimingAdapter:
        calls = 0

        async def start(self, _command):
            self.calls += 1
            if self.calls == 1:
                first_started.set()
                await release_first.wait()
                return
            raise RuntimeError("retry dispatch failed")

    service = RuntimeExecutionService(ReclaimingAdapter())
    authority = RuntimeExecutionAuthority(
        "tenant_00000000-0000-4000-8000-000000000001",
        "actor_00000000-0000-4000-8000-000000000001",
        frozenset({"curation"}),
    )
    request = {"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"}
    first = asyncio.create_task(service.start(request, authority))
    await first_started.wait()
    async with AsyncSessionLocal() as session:
        execution = (
            await session.execute(
                select(RuntimeExecution).where(RuntimeExecution.idempotency_key == request["idempotency_key"])
            )
        ).scalars().one()
        execution.updated_at = execution.updated_at.replace(year=execution.updated_at.year - 1)
        session.add(execution)
        await session.commit()

    with pytest.raises(RuntimeContractError, match="runtime-start-failed"):
        await service.start(request, authority)
    release_first.set()
    recovered, _ = await first

    assert recovered.status_code == "retryable-failure"


def test_runtime_execution_router_maps_domain_errors_to_safe_http_statuses(monkeypatch):
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
        missing = client.get(f"/api/v1/runtime-executions/exec_{uuid4()}")
        started = client.post(
            "/api/v1/runtime-executions",
            json={"workflow_type": "curation", "idempotency_key": f"idem_{uuid4()}"},
        ).json()["execution"]
        client.post(f"/api/v1/runtime-executions/{started['execution_id']}/cancel")
        stale = client.post(f"/api/v1/runtime-executions/{started['execution_id']}/cancel")

        async def cross_tenant():
            async with AsyncSessionLocal() as session:
                execution = await session.get(RuntimeExecution, started["execution_id"])
                execution.tenant_key = "tenant_00000000-0000-4000-8000-000000000002"
                session.add(execution)
                await session.commit()

        asyncio.run(cross_tenant())
        denied = client.get(f"/api/v1/runtime-executions/{started['execution_id']}")

    assert missing.status_code == 404
    assert stale.status_code == 409
    assert denied.status_code == 403


def test_runtime_execution_router_maps_adapter_failure_to_service_unavailable(monkeypatch):
    class FailedService:
        async def start(self, *_args):
            raise RuntimeContractError("runtime-start-failed")

    async def build_failed_service():
        return FailedService()

    monkeypatch.setattr(
        "src.api.router.v1.runtime_execution.build_runtime_execution_service", build_failed_service
    )
    with TestClient(app, headers=RUNTIME_HEADERS) as client:
        response = client.post(
            "/api/v1/runtime-executions", json={"workflow_type": "curation"}
        )

    assert response.status_code == 503
    assert response.json() == {"detail": {"code": "runtime-start-failed"}}
