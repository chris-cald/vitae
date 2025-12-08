"""
Resume prompt template for LLM-agnostic JSON extraction.
"""

PROMPT = (
    "Instructions:\n"
    "1. Convert the following resume text into valid JSON matching the provided schema.\n"
    "2. Map each resume section to the schema without inventing information.\n"
    "3. If a field is missing, use an empty string or empty list as appropriate.\n"
    "4. Preserve bullet points in the `description` arrays using short factual sentences.\n"
    "5. Use 'Present' if an end date is ongoing; prefer 'YYYY-MM-DD' for dates.\n"
    "6. List technical skills, languages, certifications/training, and awards exactly as they appear.\n"
    "7. Output only raw JSON, not Markdown or any other format.\n"
    "8. If you cannot extract valid JSON, return {}.\n\n"
    "Schema:\n{0}\n\n"
    "Resume:\n{1}\n"
)
