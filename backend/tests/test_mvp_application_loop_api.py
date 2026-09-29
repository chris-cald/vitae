from fastapi.testclient import TestClient

from src.main import app


def test_mvp_application_loop_demo_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/mvp/application-loop/demo")

    assert response.status_code == 200
    body = response.json()
    assert body["application"]["targetId"] == body["target"]["id"]
    assert body["misalignments"]
    assert body["deliverables"][0]["sourceRefs"]
