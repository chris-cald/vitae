"""
Job prompt template for LLM-agnostic JSON extraction.
"""

PROMPT = (
    "CRITICAL: Output only the raw JSON object. Do NOT use triple backticks, Markdown, code blocks, or any commentary. Only return the JSON.\n\n"
    "Instructions:\n"
    "1. Convert the following job posting text into valid JSON matching the provided schema.\n"
    "2. Do not add any extra fields or commentary.\n"
    "3. Use 'YYYY-MM-DD' for all dates.\n"
    "4. Ensure all URLs conform to URI format.\n"
    "5. If a field is missing, use an empty string or empty list as appropriate.\n"
    "6. If you cannot extract valid JSON, return {{}}.\n\n"
    "Schema:\n{0}\n\n"
    "Job Posting:\n{1}\n"
)
