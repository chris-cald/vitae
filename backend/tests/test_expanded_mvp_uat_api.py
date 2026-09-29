from fastapi.testclient import TestClient

from src.main import app


def test_expanded_uat_endpoint_reports_blocking_runtime_features():
    with TestClient(app) as client:
        response = client.get("/api/v1/mvp/application-loop/expanded-uat")

    assert response.status_code == 200
    body = response.json()
    assert len(body["applications"]) >= 2
    assert body["bookOfWorkRefresh"]["canonicalVaultMutated"] is False
    assert set(body["temporal"]["workflowTypes"]) >= {
        "book-of-work-refresh",
        "curation",
        "target-catalog-fit",
        "deliverable-generation",
        "application-automation",
    }
