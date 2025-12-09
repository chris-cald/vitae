import io
import os
import logging

from typing import Any
from litellm import completion  # type: ignore

logging.basicConfig(level=logging.INFO)

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
    import logging

    logging.basicConfig(level=logging.INFO)
    try:
        response: Any  # Explicit type annotation for response
        logging.info(f"Calling LiteLLM in-process with model={model}")
        logging.info(f"Prompt sent to LiteLLM:\n{prompt}")
        response = completion(
            model=model, messages=[{"role": "user", "content": prompt}]
        )
        logging.info(f"LiteLLM raw response: {response}")
        # Handle ModelResponse object or dict
        content = None
        if hasattr(response, "choices") and response.choices:
            choice = response.choices[0]
            # For OpenAI-like responses, message is an object with content
            if hasattr(choice, "message") and hasattr(choice.message, "content"):
                content = choice.message.content
        elif isinstance(response, dict):
            # Fallback for dict responses
            if (
                "choices" in response
                and response["choices"]
                and "message" in response["choices"][0]
                and "content" in response["choices"][0]["message"]
            ):
                content = response["choices"][0]["message"]["content"]
            elif "error" in response:
                logging.error(f"LiteLLM error response: {response['error']}")
        if content:
            logging.info(f"LiteLLM extracted content: {content}")
            return content
        logging.warning(
            f"LiteLLM response malformed, returning empty JSON. Full response: {response}"
        )
        return "{}"  # Fallback if response is malformed
    except Exception as e:
        logging.error(f"LiteLLM call failed: {e}")
        return "{}"  # Fallback to empty JSON on error
