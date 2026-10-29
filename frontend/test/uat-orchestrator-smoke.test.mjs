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
  assert(script.includes('uat-resume-synthetic'));

  const seedCleanup = [
    'delete(JobFit)',
    'delete(JobRequirementMapping)',
    'delete(RawJob)',
    'delete(Job)',
    'delete(Resume)',
    'delete(RawResume)',
  ];
  let lastIndex = -1;
  for (const statement of seedCleanup) {
    const index = script.indexOf(statement);
    assert(index > lastIndex, statement);
    lastIndex = index;
  }

  assert(script.includes('runtime-execution-history-source.json'));
  assert(script.includes('UAT_RUNTIME_AUTHORIZATION'));
  assert(script.includes('Authorization'));
  assert(!script.includes('temporal workflow start'));
  assert(docs.includes('scripts/uat-local.sh'));
  assert(docs.includes('UAT_RUNTIME_AUTHORIZATION'));
  assert(docs.includes('RUNTIME_EXECUTION_TOKEN:-local-runtime-token'));
  assert(readRepo('uat/playwright-cucumber/README.md').includes('RUNTIME_EXECUTION_TOKEN:-local-runtime-token'));
  assert(readRepo('compose.local.yml').includes('RUNTIME_OIDC_ACTOR_CLAIM'));
  assert(readRepo('compose.local.yml').includes('RUNTIME_OIDC_WORKFLOW_CLAIM'));
  assert(readRepo('uat/playwright-cucumber/steps/mvp-expanded-uat.steps.mjs').includes('VITAE_RUNTIME_AUTHORIZATION'));
});
