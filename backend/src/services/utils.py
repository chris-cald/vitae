import os
import io
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

    logger = logging.getLogger(__name__)

    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    try:
        from litellm import completion  # pyright: ignore[reportUnknownVariableType]

        logger.info("Calling LiteLLM with model=%s and prompt_length=%s", model, len(prompt))
        completion_kwargs = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
        }
        if os.getenv("LITELLM_API_BASE"):
            completion_kwargs["api_base"] = os.environ["LITELLM_API_BASE"]
        if os.getenv("LITELLM_API_KEY"):
            completion_kwargs["api_key"] = os.environ["LITELLM_API_KEY"]
        response = completion(**completion_kwargs)
        logger.info("LiteLLM response received")
        content: Optional[str] = None
        choices = getattr(response, "choices", None)
        if choices:
            choice = choices[0]
            message = getattr(choice, "message", None)
            if message and hasattr(message, "content"):
                content = str(message.content)
        elif isinstance(response, dict):
            if (
                "choices" in response
                and response["choices"]
                and "message" in response["choices"][0]
                and "content" in response["choices"][0]["message"]
            ):
                content = str(response["choices"][0]["message"]["content"])  # pyright: ignore[reportUnknownArgumentType]
            elif "error" in response:
                logger.error("LiteLLM error response received")
        if content:
            logger.debug("LiteLLM extracted content_length=%s", len(content))
            if not content.strip() or content.strip() == "{}":
                logger.error("LLM returned empty or invalid JSON content.")
                raise ValueError("LLM returned empty or invalid JSON content.")
            return content  # type: ignore
        logger.warning("LiteLLM response malformed or empty")
        raise ValueError("LiteLLM response malformed or empty.")
    except Exception:
        logger.error("LiteLLM call failed")
        raise


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
