import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readRepo = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('local UAT orchestrator has CI-friendly phases and artifact capture', () => {
  const script = readRepo('scripts/uat-local.sh');
  const docs = readRepo('docs/uat-readiness.md');

  for (const phase of ['setup)', 'execute)', 'capture)', 'teardown)']) {
    assert(script.includes(phase), phase);
  }
  for (const name of ['UAT_START_STACK', 'UAT_RUN_CUCUMBER', 'UAT_ARTIFACT_DIR', 'UAT_TEARDOWN']) {
    assert(script.includes(name), name);
  }
  assert(script.includes('snapshot_file_inventory'));
  assert(script.includes('assert_no_forbidden_temporal_history'));
  assert(docs.includes('scripts/uat-local.sh'));
});
