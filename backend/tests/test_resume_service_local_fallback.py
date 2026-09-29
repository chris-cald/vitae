import pytest

from src.services import resume_service as resume_service_module
from src.services.resume_service import ResumeService


@pytest.mark.asyncio
async def test_resume_upload_uses_local_parse_fallback_when_model_unavailable(monkeypatch, tmp_path):
    inserted = {}

    async def insert_raw(self, resume_id, file_path, extracted_content, content_type):
        inserted["raw"] = {
            "resume_id": resume_id,
            "file_path": file_path,
            "extracted_content": extracted_content,
            "content_type": content_type,
        }

    async def insert_processed(self, resume_id, parsed_json, name):
        inserted["processed"] = {
            "resume_id": resume_id,
            "parsed_json": parsed_json,
            "name": name,
        }

    def fail_llm(prompt):
        raise RuntimeError("provider unavailable")

    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path))
    monkeypatch.setenv("VITAE_LOCAL_PARSE_FALLBACK", "1")
    monkeypatch.setattr(resume_service_module, "call_llm_stub", fail_llm)
    monkeypatch.setattr(ResumeService, "_insert_resume_record", insert_raw)
    monkeypatch.setattr(ResumeService, "_insert_processed_resume", insert_processed)

    resume_id = await ResumeService().process_resume(
        b"# Synthetic Resume\n- Built reliable systems.\n",
        "text/markdown",
        "resume.md",
        name="Synthetic Resume",
    )

    assert resume_id.endswith("_resume.md")
    assert inserted["processed"]["name"] == "Synthetic Resume"
    assert inserted["processed"]["parsed_json"]["basics"] == {"name": "Synthetic Resume"}
    assert inserted["processed"]["parsed_json"]["work"][0]["summary"] == "Local parse fallback used."
    assert inserted["processed"]["parsed_json"]["profile_categories"]["special_requirements"] == []
