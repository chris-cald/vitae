import io
import os
from typing import Any
from litellm import completion  # type: ignore

try:
    from pdfminer.high_level import extract_text as extract_pdf_text
except ImportError:
    extract_pdf_text = None
try:
    import docx
except ImportError:
    docx = None


def extract_pdf_text_util(file_bytes: bytes) -> str:
    if extract_pdf_text is None:
        return "pdfminer.six not installed."
    try:
        with io.BytesIO(file_bytes) as pdf_stream:
            text = extract_pdf_text(pdf_stream)
        return text
    except Exception as exc:
        return f"PDF extraction error: {exc}"


def extract_docx_text_util(file_bytes: bytes) -> str:
    if docx is None:
        return "python-docx not installed."
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        return text
    except Exception as exc:
        return f"DOCX extraction error: {exc}"


def load_schema(schema_path: str) -> str:
    with open(schema_path, "r") as f:
        return f.read()


def call_llm_stub(prompt: str) -> str:
    # Use LiteLLM to call an LLM and return the result
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    api_base = os.getenv("LLM_PROVIDER", None)
    try:
        response: Any  # Explicit type annotation for response
        if api_base:
            response = completion(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                api_base=api_base,
            )
        else:
            response = completion(
                model=model, messages=[{"role": "user", "content": prompt}]
            )
        # Defensive: ensure response structure
        if (
            isinstance(response, dict)
            and "choices" in response
            and response["choices"]
            and "message" in response["choices"][0]
            and "content" in response["choices"][0]["message"]
        ):
            return response["choices"][0]["message"]["content"]  # type: ignore
        return "{}"  # Fallback if response is malformed
    except Exception:
        return "{}"  # Fallback to empty JSON on error
