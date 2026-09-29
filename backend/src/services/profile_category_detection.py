# Simple rule-based auto-detection for profile categories from job data
import logging
import re
from typing import Dict, Any, List
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from src.category_config import CATEGORY_CONFIG
from functools import lru_cache

logger = logging.getLogger(__name__)


def detect_profile_categories(job_data: Dict[str, Any]) -> Dict[str, object]:
    title = (job_data.get("title") or "").lower()
    description = (job_data.get("description") or "").lower()
    text = f"{title} {description}"
    # Try embedding-based detection first; fall back safely when the embedding
    # provider/model is unavailable in local or CI environments.
    try:
        emb_result = embedding_based_category_detection(text)
    except Exception:
        logger.warning("Embedding-based category detection unavailable")
        emb_result = {}
    # Fallback/boost with rule-based
    rule_result = rule_based_category_detection(text)
    final: Dict[str, object] = {}
    for cat in CATEGORY_CONFIG.keys():
        # Prefer embedding if confident, else rule-based
        if emb_result.get(cat):
            final[cat] = emb_result[cat]
        elif rule_result.get(cat):
            final[cat] = rule_result[cat]
        else:
            final[cat] = None
    # Special requirements: always union both
    emb_special = emb_result.get("special_requirements")
    if not isinstance(emb_special, list):
        emb_special = [emb_special] if emb_special is not None else []
    rule_special = rule_result.get("special_requirements")
    if not isinstance(rule_special, list):
        rule_special = [rule_special] if rule_special is not None else []
    final["special_requirements"] = list(set(emb_special + rule_special))
    return final


def _canonical_category_texts() -> Dict[str, List[str]]:
    """Return canonical descriptions for each category value."""
    result: Dict[str, List[str]] = {}
    for cat, conf in CATEGORY_CONFIG.items():
        result[cat] = [v["fragment"] for v in conf["values"]]
    return result


def _category_value_names() -> Dict[str, List[str]]:
    result: Dict[str, List[str]] = {}
    for cat, conf in CATEGORY_CONFIG.items():
        result[cat] = [v["value"] for v in conf["values"]]
    return result


def embedding_based_category_detection(text: str) -> Dict[str, Any]:
    from .litellm_embedding import weighted_pool_embeddings

    # Add a simple in-memory cache for embeddings
    @lru_cache(maxsize=256)
    def cached_weighted_pool_embeddings(text: str):
        # weighted_pool_embeddings expects a list, so wrap text in a list
        return weighted_pool_embeddings([text])

    canonical_texts = _canonical_category_texts()
    value_names = _category_value_names()
    detected: Dict[str, Any] = {}
    # Use cached weighted pooling of chunk embeddings
    text_emb = cached_weighted_pool_embeddings(text)[0]
    for cat, fragments in canonical_texts.items():
        # Embed each fragment using cached_weighted_pool_embeddings
        cat_embs = [cached_weighted_pool_embeddings(frag)[0] for frag in fragments]
        # Compute cosine similarity
        sims = cosine_similarity(np.array([text_emb]), np.array(cat_embs))[0]
        logger.debug("Category similarity evaluated for category=%s", cat)
        for score in sims:
            logger.debug("Category similarity score=%s", round(float(score), 4))
        idx = int(np.argmax(sims))
        if sims[idx] > 0.5:
            detected[cat] = value_names[cat][idx]
        else:
            detected[cat] = None
    detected["special_requirements"] = detected.get("special_requirements", [])
    return detected


def rule_based_category_detection(text: str) -> Dict[str, Any]:
    detected: Dict[str, Any] = {}
    # Industry
    for v in CATEGORY_CONFIG["industry"]["values"]:
        if v["value"].lower() in text:
            detected["industry"] = v["value"]
            break
    # Function
    for v in CATEGORY_CONFIG["function"]["values"]:
        if any(word in text for word in re.split(r"[ /]", v["value"].lower())):
            detected["function"] = v["value"]
            break
    # Seniority
    for v in CATEGORY_CONFIG["seniority"]["values"]:
        if v["value"].lower().split()[0] in text:
            detected["seniority"] = v["value"]
            break
    # Company size (not usually in JD, skip or set None)
    detected["company_size"] = None
    # Geography
    for v in CATEGORY_CONFIG["geography"]["values"]:
        if v["value"].lower() in text:
            detected["geography"] = v["value"]
            break
    # Special requirements
    detected["special_requirements"] = [
        v["value"]
        for v in CATEGORY_CONFIG["special_requirements"]["values"]
        if v["value"].lower() in text
    ]
    # Ensure type is always List[str]
    return detected
