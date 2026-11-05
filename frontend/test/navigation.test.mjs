import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

test('uses one accessible collapsible left navigation', () => {
  assert.match(app, /<aside[^>]+aria-label="Main navigation"/);
  assert.match(app, /aria-label={sidebarOpen \? 'Collapse navigation' : 'Expand navigation'}/);
  assert.match(app, /aria-expanded={sidebarOpen}/);
  assert.match(app, /aria-current={step === item\.key \? 'page' : undefined}/);
  assert.doesNotMatch(app, /<ol/);
  assert.doesNotMatch(app, /Stepper/);
});
