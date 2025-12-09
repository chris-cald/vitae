"""
Job-fit prompt template for LLM-agnostic JSON extraction.
"""

PROMPT = (
    "CRITICAL: Output only the raw JSON object. Do NOT use triple backticks, Markdown, code blocks, or any commentary. Only return the JSON.\n\n"
    "Instructions:\n"
    "1. Convert the following resume and job description into valid JSON matching the provided schema.\n"
    "2. Evaluate the fit and assign a score (0-100).\n"
    "3. Write a concise analysis summarizing strengths and weaknesses.\n"
    "4. For each feedback item, use an action-oriented intent (preserve, add, remove, reword, reformat, move, clarify) and provide a clear, actionable message, line/section reference, and weight (0.0-1.0).\n"
    "5. Extract relevant job keywords and compare skills.\n"
    "6. If you cannot extract valid JSON, return {{}}.\n\n"
    "Schema:\n{0}\n\n"
    "Resume:\n{1}\n\n"
    "Job Description:\n{2}\n"
)
