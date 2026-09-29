from src.services.mvp_application_loop_service import build_demo_application_loop


def test_demo_application_loop_covers_mvp_uat_path():
    loop = build_demo_application_loop()

    assert loop["target"]["id"] == loop["fitAnalysis"]["targetId"]
    assert {r["id"] for r in loop["requirements"]} >= {
        item["requirementId"] for item in loop["fitAnalysis"]["requirementMappings"]
    }
    assert loop["application"]["targetId"] == loop["target"]["id"]
    assert loop["deliverables"]
    assert loop["deliverables"][0]["id"] in loop["application"]["deliverableIds"]
    assert loop["deliverables"][0]["sourceRefs"]
    assert loop["deliverables"][0]["catalogAssetIds"]
    assert {m["category"] for m in loop["misalignments"]} == {
        "harvest",
        "cull",
        "prime",
        "substantiate",
    }
    assert all(r["misalignmentId"] in {m["id"] for m in loop["misalignments"]} for r in loop["recommendations"])
    assert len({r["id"] for r in loop["recommendations"]}) == len(loop["recommendations"])


def test_demo_application_loop_exposes_only_source_refs_not_raw_documents():
    loop = build_demo_application_loop()
    rendered = str(loop)

    assert "rawResumeText" not in rendered
    assert "rawJobDescription" not in rendered
    assert "prompt" not in rendered.lower()
    assert "completion" not in rendered.lower()
