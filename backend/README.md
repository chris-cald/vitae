## Customization Axes for Tailored ATS Feedback


To further enhance feedback quality and relevance, implement customization based on key candidate/job context customization axes ("targeting criteria" or "profile categories").

### Key Profile Categories
- **Industry** (e.g., Technology, Healthcare, Finance, Education)
- **Function/Role** (e.g., Software Engineer, Product Manager, Data Scientist, Sales Director)
- **Seniority Level** (e.g., Entry, Mid, Senior, Executive)
- **Company Size/Stage** (e.g., Startup, SMB, Enterprise, Public Sector)
- **Geography/Region** (if relevant)
- **Special Requirements** (e.g., Security Clearance, Certifications)

### Implementation Action Plan
- [ ] Define a set of widely accepted values for each profile category (see list above)
- [ ] For each value, create modular prompt fragments or configuration objects that inject relevant language, priorities, and evaluation criteria
- [ ] Use generic or fallback fragments for less common or overlapping values
- [ ] Dynamically assemble prompts by layering fragments (e.g., Industry + Function + Level)
- [ ] Allow users to select options for each category when submitting a resume/job for analysis
- [ ] Inject the selected prompt fragments into the ATS analysis and feedback workflow
- [ ] Make it easy to update or expand the lists and prompt fragments as needed

This modular, composable approach enables scalable, specialist-level tailoring for each candidate/job context, closely mirroring the expertise of a recruiting and placement professional while remaining practical to maintain.

## ATS Job-Fit Analysis & Resume Tailoring Workflow

To implement high-fidelity, actionable job-fit analysis and resume tailoring:

### 1. Structured Parsing
- Parse uploaded master resume and job description into structured JSON (see [JSON Resume schema](https://jsonresume.org/schema/)).
- Ensure each section (Experience, Skills, Education, etc.) and job requirements are distinct nodes.

### 2. ATS Alignment & Scoring
- Compare resume JSON to job description JSON using ATS-style criteria:
   - Direct keyword matches
   - Semantic similarity (NLP embeddings)
   - Depth/relevance of experience
   - Job level alignment (executive, manager, IC)
- Produce ATS-equivalent alignment scores for overall job-fit and per-section fit.

### 3. Actionable Feedback Generation
- For each job requirement, provide:
   - Matched resume content (with score)
   - Gaps/missing elements (with suggestions)
   - Recommendations for rewording/reordering
- Document all mapping and transformation steps for transparency.

### 4. Automated Revision Proposal
- Generate a proposed revision of the resume JSON:
   - Reorder sections/bullets for highest alignment
   - Rephrase content to incorporate job keywords (preserving authenticity)
   - Emphasize quantifiable achievements
- Update alignment scores and feedback for the revised version.

### 5. Resume Rendering
- Render the updated resume JSON using a user-provided template (markdown or other formats).
- Ensure formatting, section headers, and bullet points match ATS standards.

### 6. Output Decision Summary & Recommendations
- Summarize experience selection, wording changes, and rationale.
- Provide ATS optimization, content gap analysis, and alignment opportunities.

### 7. Recommended Libraries/Tools
- NLP: spaCy, transformers, sentence-transformers
- Scoring: Custom rubric, embedding similarity
- Rendering: Jinja2, markdown-it, or custom renderer

### 8. Concrete Implementation Tasks
- [ ] Implement resume/job parsing to structured JSON
- [ ] Develop ATS alignment and scoring logic
- [ ] Generate actionable feedback and revision proposals
- [ ] Render updated resume using template
- [ ] Document all decisions and mappings
- [ ] Expose endpoints for analysis, feedback, and rendering
# Vitae Backend

Vitae Backend is a modular, AI-powered microservice for parsing, analyzing, and matching resumes and job descriptions. It is designed for secure, scalable, and ATS-focused resume/job processing, leveraging local LLMs and robust schema validation.

## Purpose
- **Resume Parsing:** Convert PDF/DOCX resumes into [JSON Resume](https://jsonresume.org/schema/) (open standard) structured JSON (personal data, experiences, skills, education, etc.).
- **Job Parsing:** Extract structured data from job descriptions for downstream matching.
- **ATS Compatibility:** Score and suggest improvements for resumes against job postings using AI and embeddings.
- **Security:** Handles PII with strict validation, secure file handling, and minimal data retention.

## Features
- Local AI agent management (Ollama, OpenAI, LlamaIndex)
- Modular service and model architecture
- Pydantic and JSON schema validation
- RESTful API for upload, processing, and scoring
- Temporary file handling for secure document processing

## Installation
1. **Clone the repository** (if not already):
   ```sh
   git clone <repo-url>
   cd vitae/backend
   ```
2. **Create a virtual environment:**
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   # Or install FastAPI, SQLAlchemy, MarkItDown, and your LLM provider manually
   ```
4. **Configure environment variables:**
   - Set LLM provider/model and database connection in your `.env` or config file as needed.

## Basic Usage
1. **Run the FastAPI app:**
   ```sh
   uvicorn main:app --reload
   ```
2. **API Endpoints:**
   - `POST /api/v1/resume/upload` — Upload a resume (PDF/DOCX)
   - `POST /api/v1/job/upload` — Upload a job description (JSON)
   - `POST /api/v1/score-improvement/{resume_id}/{job_id}` — Score and suggest improvements

3. **Example Request:**
   ```sh
   curl -F "file=@resume.pdf" http://localhost:8000/api/v1/resume/upload
   ```

## Development
- All core logic is in `models/`, `services/`, `agent/`, `prompt/`, and `schemas/`.
- Extend or swap AI providers in `agent/manager.py`.
- Add new endpoints in `api/router/v1/`.

## Security Notes
- All file processing uses temporary files and strict validation.
- PII is never logged or stored beyond processing.

## License
MIT (see root project)
