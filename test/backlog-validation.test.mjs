import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const wrapper = join(root, 'scripts/validate-backlog.mjs');

function fixture(t, mode = 'success') {
  const temp = mkdtempSync(join(tmpdir(), 'vitae backlog validation '));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const schemaDir = join(temp, 'schemas', 'work-management');
  const binDir = join(temp, 'bin with spaces');
  mkdirSync(schemaDir, { recursive: true });
  mkdirSync(dirname(join(schemaDir, '..', 'frontmatter', 'schema-map.json')), { recursive: true });
  writeFileSync(join(schemaDir, '..', 'frontmatter', 'schema-map.json'), '{}\n');
  const capture = join(temp, 'arguments.json');
  const dv = join(binDir, 'dv');
  mkdirSync(binDir, { recursive: true });
  const body = mode === 'signal'
    ? "process.kill(process.pid, 'SIGTERM');"
    : `require('node:fs').writeFileSync(${JSON.stringify(capture)}, JSON.stringify(process.argv.slice(2))); process.exit(${mode === 'failure' ? 23 : 0});`;
  writeFileSync(dv, `#!/usr/bin/env node\n${body}\n`);
  chmodSync(dv, 0o755);
  return { schemaDir, schemaMap: join(schemaDir, '..', 'frontmatter', 'schema-map.json'), binDir, capture };
}

function run(env) {
  return spawnSync(process.execPath, [wrapper], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('backlog validation wrapper passes its explicit map to dv through a PATH containing spaces', t => {
  const { schemaDir, binDir, capture } = fixture(t);
  const result = run({
    DV_WORK_MANAGEMENT_SCHEMA_DIR: schemaDir,
    PATH: `${binDir}:${process.env.PATH}`,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(readFileSync(capture, 'utf8')), [
    'backlog', 'validate', '--dir', 'backlog', '--schema-map',
    join(schemaDir, '..', 'frontmatter', 'schema-map.json'),
    '--profile', 'ci', '--format', 'json', '--fail-on', 'error',
  ]);
});

test('backlog validation wrapper fails before spawning dv when authority input is absent or invalid', t => {
  const { binDir } = fixture(t);
  const result = run({
    DV_WORK_MANAGEMENT_SCHEMA_DIR: join(binDir, 'missing'),
    PATH: binDir,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DV_WORK_MANAGEMENT_SCHEMA_DIR must name a directory/);
});

test('backlog validation wrapper rejects a malformed derived schema map', t => {
  const { schemaDir, schemaMap, binDir } = fixture(t);
  rmSync(schemaMap);
  mkdirSync(schemaMap);
  const result = run({ DV_WORK_MANAGEMENT_SCHEMA_DIR: schemaDir, PATH: binDir });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Derived schema map is missing or not a file/);
});

test('backlog validation wrapper fails closed when dv is unavailable', t => {
  const { schemaDir, binDir } = fixture(t);
  rmSync(join(binDir, 'dv'));
  const result = run({ DV_WORK_MANAGEMENT_SCHEMA_DIR: schemaDir, PATH: `${binDir}:${dirname(process.execPath)}` });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unable to invoke dv/);
});

test('backlog validation wrapper preserves dv exit status', t => {
  const { schemaDir, binDir } = fixture(t, 'failure');
  const result = run({ DV_WORK_MANAGEMENT_SCHEMA_DIR: schemaDir, PATH: `${binDir}:${process.env.PATH}` });
  assert.equal(result.status, 23);
});

test('backlog validation wrapper preserves dv termination signal', t => {
  const { schemaDir, binDir } = fixture(t, 'signal');
  const result = run({ DV_WORK_MANAGEMENT_SCHEMA_DIR: schemaDir, PATH: `${binDir}:${process.env.PATH}` });
  assert.equal(result.signal, 'SIGTERM');
});
