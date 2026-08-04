from src.services.profile_category_detection import detect_profile_categories


def test_embedding_failure_falls_back_to_rule_based_detection(monkeypatch):
    from src.services import profile_category_detection

    def fail_embedding_detection(text: str):
        raise RuntimeError("embedding service unavailable")

    monkeypatch.setattr(
        profile_category_detection,
        "embedding_based_category_detection",
        fail_embedding_detection,
    )
    job_data = {
        "title": "Senior Data Scientist",
        "description": "We are looking for a Senior Data Scientist to join our analytics team in a fast-growing technology company. Experience with machine learning, data analysis, and leadership required. Location: North America. Must have Security Clearance.",
    }
    categories = detect_profile_categories(job_data)
    assert categories["function"] == "Data Science/Analytics"
    assert categories["seniority"] == "Senior"
    assert categories["geography"] == "North America"
    assert "Security Clearance" in categories["special_requirements"]


def test_embedding_and_rule_based_detection():
    job_data = {
        "title": "Senior Data Scientist",
        "description": "We are looking for a Senior Data Scientist to join our analytics team in a fast-growing technology company. Experience with machine learning, data analysis, and leadership required. Location: North America. Must have Security Clearance.",
    }
    categories = detect_profile_categories(job_data)
    assert categories["industry"] in ["Technology", "__default__"]
    assert categories["function"] in ["Data Science/Analytics", "__default__"]
    assert categories["seniority"] in ["Senior", "__default__"]
    assert categories["geography"] in ["North America", "__default__"]
    special_requirements = categories.get("special_requirements", [])
    if not isinstance(special_requirements, (list, tuple, set)):
        special_requirements = [special_requirements]
    assert "Security Clearance" in special_requirements
    # Company size is likely None
    assert categories["company_size"] is None
