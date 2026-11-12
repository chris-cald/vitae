import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repo = path.resolve(import.meta.dirname, '../../..');
const suite = 'doc-packs/vitae-sdlc/test/legacy-backlog-metadata.test.mjs';
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'wi072-proof-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ['backlog', 'docs/evidence/wi-072', suite, 'doc-packs/vitae-sdlc/test/wi-072-evidence-loader.mjs']) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    cpSync(path.join(repo, name), path.join(root, name), { recursive: true });
  }
  symlinkSync(path.join(repo, 'doc-packs/vitae-sdlc/node_modules'), path.join(root, 'doc-packs/vitae-sdlc/node_modules'), 'dir');
  return root;
}
function run(root) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['--test', path.join(root, suite)], { encoding: 'utf8', env });
}
function update(root, file, transform) {
  const target = path.join(root, 'backlog', file);
  writeFileSync(target, transform(readFileSync(target, 'utf8')));
}

test('WI-072 historical repair proof survives legitimate later work in isolated backlog fixtures', t => {
  const root = fixture(t);
  update(root, '072-normalize-legacy-backlog-metadata.md', source => source
    .replace('status: running', 'status: completed')
    .replace('status_reason: implementation', 'status_reason: completed')
    .replace('- [ ]', '- [x]'));
  update(root, '070-validate-connected-mock-dual-lifecycles.md', source => source
    .replace('status: ready', 'status: running')
    .replace(/^status_reason:.*$/m, 'status_reason: implementation') + '\nSynthetic later progress for isolated test only.\n');
  update(root, '050-deliver-job-search-application-funnel-slice.md', source => source
    .replace('status: ready', 'status: completed')
    .replace('status_reason: auto', 'status_reason: completed')
    .replace('estimated: 8', 'estimated: 8\nactual: 8') + '\nSynthetic later completion for isolated test only.\n');
  const result = run(root);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('WI-072 current schema validation still rejects invalid later metadata', t => {
  const root = fixture(t);
  update(root, '050-deliver-job-search-application-funnel-slice.md', source => source.replace('estimated: 8', 'estimated: invalid'));
  const result = run(root);
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /must be number/);
});

test('WI-072 immutable repair snapshot rejects tampering', t => {
  const root = fixture(t);
  const snapshot = path.join(root, 'docs/evidence/wi-072/repair-snapshot.json');
  writeFileSync(snapshot, readFileSync(snapshot, 'utf8').replace('1ca2cc0936c0aae1dc3f50a6b9ae0200712d7453', '0000000000000000000000000000000000000000'));
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /repair-snapshot\.json: canonical payload hash mismatch/);
});
