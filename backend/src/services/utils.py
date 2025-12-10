import io
import os
from typing import Any, Type, Optional
from sqlmodel import select

try:
    from pdfminer.high_level import extract_text as extract_pdf_text
except ImportError:
    extract_pdf_text = None
try:
    import docx
except ImportError:
    docx = None


def extract_pdf_text_util(file_bytes: bytes) -> str:
    import logging

    if extract_pdf_text is None:
        logging.warning(
            "PDF extraction requested but pdfminer.six is not installed. Please install pdfminer.six to enable PDF text extraction."
        )
        return "pdfminer.six not installed."
    try:
        with io.BytesIO(file_bytes) as pdf_stream:
            text = extract_pdf_text(pdf_stream)
        return text
    except Exception as exc:
        return f"PDF extraction error: {exc}"


def extract_docx_text_util(file_bytes: bytes) -> str:
    import logging

    if docx is None:
        logging.warning(
            "DOCX extraction requested but python-docx is not installed. Please install python-docx to enable DOCX text extraction."
        )
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
    """
    Use LiteLLM in-process or via proxy, letting LiteLLM handle routing based on environment/config.
    """
    import logging

    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    logging.basicConfig(level=logging.INFO)
    try:
        from litellm import completion  # type: ignore

        logging.info(f"Calling LiteLLM with model={model}")
        logging.info(f"Prompt sent to LiteLLM:\n{prompt}")
        response = completion(
            model=model, messages=[{"role": "user", "content": prompt}]
        )
        content = None
        if hasattr(response, "choices") and response.choices:  # type: ignore
            choice = response.choices[0]  # type: ignore
            if hasattr(choice, "message") and hasattr(choice.message, "content"):  # type: ignore
                content = choice.message.content  # type: ignore
        elif isinstance(response, dict):
            if (
                "choices" in response
                and response["choices"]
                and "message" in response["choices"][0]
                and "content" in response["choices"][0]["message"]
            ):
                content = response["choices"][0]["message"]["content"]  # type: ignore
            elif "error" in response:
                logging.error(f"LiteLLM error response: {response['error']}")
        if content:
            logging.info(f"LiteLLM extracted content: {content}")
            return content  # type: ignore
        logging.warning(
            f"LiteLLM response malformed, returning empty JSON. Full response: {response}"
        )
        return "{}"  # Fallback if response is malformed
    except Exception as e:
        logging.error(f"LiteLLM call failed: {e}")
        return "{}"  # Fallback to empty JSON on error


# Strip code block fencing if present
def strip_code_fence(text: str) -> str:
    import re

    match = re.match(r"^```[a-zA-Z]*\n([\s\S]*?)```$", text.strip())
    if match:
        return match.group(1).strip()
    if text.strip().startswith("```") and text.strip().endswith("```"):
        return text.strip().strip("`").strip()
    return text.strip()


# Reusable async DB fetch helper
async def get_or_404(
    session: Any,
    model: Type[Any],
    id_field: str,
    id_value: Any,
    error_message: Optional[str] = None,
) -> Any:
    statement = select(model).where(getattr(model, id_field) == id_value)
    result = await session.execute(statement)
    obj = result.scalars().one_or_none()
    if obj is None:
        raise ValueError(
            error_message or f"{model.__name__} with {id_field} {id_value} not found."
        )
    return obj
