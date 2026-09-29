import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readRepo = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('Playwright/Cucumber UAT fixture is wired to WI-040 evidence', () => {
  const feature = readRepo('uat/playwright-cucumber/features/mvp-expanded-uat.feature');
  const steps = readRepo('uat/playwright-cucumber/steps/mvp-expanded-uat.steps.mjs');
  const readme = readRepo('uat/playwright-cucumber/README.md');

  assert(feature.includes('@wi-040'));
  assert(feature.includes('canonical vault remains unchanged'));
  assert(feature.includes('Temporal history remains opaque'));
  assert(steps.includes("from '@cucumber/cucumber'"));
  assert(steps.includes("from 'playwright'"));
  assert(steps.includes('assertNoForbiddenTemporalHistory'));
  assert(readme.includes('OpenAI-compatible bridge'));
});
