import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('ESM config files avoid CommonJS globals', () => {
  assert(!read('vite.config.js').includes('__dirname'));
  assert(!read('tailwind.config.js').includes('require('));
});
