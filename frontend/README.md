

## Resume Rendering & ATS Job-Fit Feedback Tasks


## Targeting Criteria & Prompt Customization

- [x] Support user selection of key profile categories (Industry, Function, Seniority, Company Size, etc.)
- [x] Integrate with backend to inject modular prompt fragments based on selected criteria
- [x] Ensure UI allows for easy extension and maintenance of category lists and prompt fragments
- [ ] Display which targeting criteria are active in the analysis and feedback views

- [ ] Implement resume JSON rendering using user-provided template (markdown or other format)
- [ ] Display actionable ATS job-fit feedback and alignment scores interactively
- [ ] Support selection and preview of resume templates
- [ ] Integrate backend endpoints for ATS analysis, feedback, and rendering
- [ ] Ensure ATS-friendly formatting in rendered output
- [ ] Provide UI for reviewing and applying revision suggestions
# Vitae Frontend

This project is a React app (Vite + Shadcn UI) for interacting with the Vitae backend. It allows users to:
- Upload resumes (PDF/DOCX)
- Upload job descriptions (JSON)
- Run job-fit analysis between a resume and a job description

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Features
- Intuitive forms for uploading resumes and job descriptions
- Job-fit analysis with results display
- Modern UI using Shadcn components


## Backend API
See `/backend/docs/api/openapi.yaml` for details.


## Project Tasks

This section tracks the main setup and development tasks for the Vitae frontend project. Add new tasks below as needed.

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Implement category selector UI and integration
- [x] Prepopulate selectors with detected categories from backend
- [x] Modular prompt fragment system in UI
- [ ] Display which targeting criteria are active in the analysis and feedback views
- [ ] Ensure Documentation is Complete
