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
