import io
import os
import asyncio
import json

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
    except Exception as e:
        return f"PDF extraction error: {e}"


def extract_docx_text_util(file_bytes: bytes) -> str:
    if docx is None:
        return "python-docx not installed."
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        return text
    except Exception as e:
        return f"DOCX extraction error: {e}"


def load_schema(schema_path: str) -> str:
    with open(schema_path, "r") as f:
        return f.read()


def call_llm_stub(prompt: str) -> str:
    # Placeholder: call to LLM API
    # In real implementation, replace with actual LLM call
    asyncio.run(asyncio.sleep(1))
    return "{}"  # Return empty JSON for now
