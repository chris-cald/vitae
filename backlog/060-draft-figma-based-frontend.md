---
id: wi-060
title: Draft Figma-Based Frontend
type: work-item
subtype: story
lifecycle: active
status: running
status_reason: implementation
priority: medium
estimated: 2
links:
  parent: []
  depends_on: []
  implements: []
tags:
  - frontend
  - afk
---

# Draft Figma-Based Frontend

Create a self-contained React frontend draft in `frontend-draft/` based on the current Vitae Figma workbench. It is a visual, interactive mock only: it must not change the production frontend or call backend APIs.

## Acceptance Criteria

- [x] `frontend-draft/` contains a runnable React + TypeScript application.
- [x] The application expresses the focused Vitae workbench visual direction from the Figma screens.
- [x] It includes clickable navigation and mocked lifecycle views for applications, career knowledge, catalog, deliverables, activity, and decisions.
- [x] It uses local mock data only and does not log or include real resume/job content.
- [x] The new application builds successfully with its documented command.

## Exclusions

- Production frontend routing, API integration, persistence, authentication, and backend changes.
