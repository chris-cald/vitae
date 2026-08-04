"""
Job-fit prompt template for LLM-agnostic JSON extraction.
"""

PROMPT = (
    "CRITICAL: Output only the raw JSON object. Do NOT use triple backticks, Markdown, code blocks, or any commentary. Only return the JSON.\n\n"
    "Instructions:\n"
    "1. Carefully analyze the resume and job description below. Use only information present in these sources—do not speculate or fabricate details.\n"
    "2. For each major job requirement, provide:\n"
    "   - Strengths: Where the candidate matches or exceeds the requirement.\n"
    "   - Weaknesses: Where the candidate falls short or lacks evidence.\n"
    "   - Gaps: Missing skills, experience, or qualifications.\n"
    "   - Actionable suggestions: Specific, practical advice for improvement or clarification.\n"
    "3. The 'feedback' array MUST contain at least one actionable item for each major job requirement, with clear intent (preserve, add, remove, reword, reformat, move, clarify), a precise message, line/section reference, and weight (0.0-1.0).\n"
    "4. Provide a comprehensive analysis summarizing overall fit, with explicit references to resume and job description sections.\n"
    "5. Extract and compare relevant job keywords and candidate skills, highlighting matches and mismatches.\n"
    "6. Assign a fit score (0-100) based on the evidence provided, and justify the score in the analysis.\n"
    "7. If you cannot extract valid JSON, return {{}}.\n\n"
    "Schema:\n{0}\n\n"
    "Resume:\n{1}\n\n"
    "Job Description:\n{2}\n"
)
