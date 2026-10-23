import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const packageJson = () => JSON.parse(read('package.json'));

test('root validation uses the locked backend environment and frontend TS gates', () => {
  const { packageManager, scripts } = packageJson();

  assert.match(packageManager, /^npm@\d+\.\d+\.\d+$/);
  assert.match(scripts.check, /test:backend/);
  assert.match(scripts.check, /test:frontend/);
  assert.match(scripts.check, /typecheck/);
  assert.match(scripts.check, /lint/);
  assert.doesNotMatch(scripts.check, /python3|PYTHON=/);
  assert.match(scripts['test:backend'], /uv .*run .*--locked .*--no-sync .*pytest/);
  assert.equal(existsSync(resolve(root, 'backend/pyproject.toml')), true);
  assert.equal(existsSync(resolve(root, 'backend/uv.lock')), true);
});

test('rehearsal verifies the documented synthetic demo contract', () => {
  const { scripts } = packageJson();

  assert.match(scripts['pilot:rehearse'], /test:release/);
  assert.match(scripts['pilot:rehearse'], /validate:backlog/);
  assert.match(scripts['validate:backlog'], /^dv backlog validate/);
  assert.match(read('docs/uat-readiness.md'), /\/api\/v1\/mvp\/application-loop\/demo/);
  assert.match(read('backend/src/api/router/v1/mvp.py'), /@router\.get\("\/mvp\/application-loop\/demo"/);
  assert.match(read('.github/workflows/validation.yml'), /npm run test:release/);
});
