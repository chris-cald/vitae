---
$schema: schemas/work-management/frontmatter/record.json
id: record:wi-054-historical-synthetic-validation
title: WI-054 historical synthetic validation
summary: WI-054 historical synthetic validation
type: record
subtype: test-result
lifecycle: active
status: ready
status_reason: recorded
links:
  supporting_reference:
    - https://github.com/chris-cald/vitae/actions/runs/40740138417/job/122999192661
    - https://github.com/chris-cald/vitae/actions/runs/40740124311/job/122999146170
    - https://github.com/chris-cald/vitae/pull/9
    - '`ff1b6a3f682d2670500efa005a374c8ea4bd59c1`'
    - '`7ab345902b54a5e617e653518773db52f0005d9c`'
---

## Recorded At

2026-10-28T23:45:18.534Z

## Outcome

pass

## Observation

Merged PR #9 passed both GitHub Validation checks and retained synthetic-only validation coverage; no live UAT was run.

## Subject References

- wi-054
- claim:f43062db443e60d4dd0ac1b61858925a142cb6a9b165d08bb06ed9994edf8d8e
- wi:054

## Artifact References

- https://github.com/chris-cald/vitae/pull/9

## Supporting References

- https://github.com/chris-cald/vitae/actions/runs/40740138417/job/122999192661
- https://github.com/chris-cald/vitae/actions/runs/40740124311/job/122999146170
- https://github.com/chris-cald/vitae/pull/9
- `ff1b6a3f682d2670500efa005a374c8ea4bd59c1`
- `7ab345902b54a5e617e653518773db52f0005d9c`

## Notes

- Synthetic inventory scope only; cull/publication and live provider/browser/Temporal UAT remain WI-057.
- Verified historical changed file: backend/db/alembic/env.py
- Verified historical changed file: backend/db/alembic/versions/20261027_add_career_inventory.py
- Verified historical changed file: backend/db/db.py
- Verified historical changed file: backend/src/api/router/v1/__init__.py
- Verified historical changed file: backend/src/api/router/v1/career_inventory.py
- Verified historical changed file: backend/src/main.py
- Verified historical changed file: backend/src/models/career_inventory.py
- Verified historical changed file: backend/src/services/career_inventory_service.py
- Verified historical changed file: backend/tests/test_career_inventory_service.py
- Verified historical changed file: backlog/054-add-career-inventory-and-curation-slice.md
- Verified historical changed file: backlog/records/record-wi-054-synthetic-inventory-validation-passed.md
- Verified historical changed file: frontend/src/App.tsx
- Verified historical changed file: frontend/src/components/career/CareerInventory.tsx
- Verified historical changed file: frontend/src/lib/api.ts
- Verified historical changed file: frontend/test/application-bundle-workspace.test.mjs
