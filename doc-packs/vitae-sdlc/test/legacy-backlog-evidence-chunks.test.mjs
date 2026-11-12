import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { readChanges, readRepairSnapshot } from './wi-072-evidence-loader.mjs';

const repo = path.resolve(import.meta.dirname, '../../..');
const evidence = path.join(repo, 'docs/evidence/wi-072');
const changesCanonicalSha256 = '29145b86579349d341c69fda4e341b913609e279c39d00a1822fac1fd74fe02c';
const changesCanonicalBytes = 106458;
const snapshotCanonicalSha256 = '2e4c1fbfeef48c7cba3c2de8d4c9658d6ccbaeac51ef14b336228b7e91844b91';
const snapshotCanonicalBytes = 155723;
const canonical = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => createHash('sha256').update(value).digest('hex');
const copyEvidence = t => {
  const target = path.join(tmpdir(), `wi072-evidence-${process.pid}-${Date.now()}`);
  cpSync(evidence, target, { recursive: true });
  t.after(() => rmSync(target, { recursive: true, force: true }));
  return target;
};

test('WI-072 chunked evidence reconstructs the exact immutable source payloads', () => {
  const changes = readChanges(evidence);
  const snapshot = readRepairSnapshot(evidence);
  const changesSource = canonical(changes);
  const snapshotSource = canonical(snapshot);

  assert.equal(Buffer.byteLength(changesSource), changesCanonicalBytes);
  assert.equal(sha256(changesSource), changesCanonicalSha256);
  assert.equal(Buffer.byteLength(snapshotSource), snapshotCanonicalBytes);
  assert.equal(sha256(snapshotSource), snapshotCanonicalSha256);
  assert.equal(changes.length, 59);
  assert.equal(snapshot.files.length, 59);
});

test('WI-072 reconstruction runs from a source-only checkout with no Git executable or history', t => {
  if (process.env.WI072_SOURCE_ONLY_CHILD) return;
  const root = path.join(tmpdir(), `wi072-source-only-${process.pid}-${Date.now()}`);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const suite = 'doc-packs/vitae-sdlc/test/legacy-backlog-evidence-chunks.test.mjs';
  const loader = 'doc-packs/vitae-sdlc/test/wi-072-evidence-loader.mjs';
  cpSync(path.join(repo, 'docs/evidence/wi-072'), path.join(root, 'docs/evidence/wi-072'), { recursive: true });
  for (const name of [suite, loader]) {
    const target = path.join(root, name);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(repo, name), target);
  }
  const emptyBin = path.join(root, 'empty-bin');
  mkdirSync(emptyBin);
  const env = { ...process.env, PATH: emptyBin, GIT_DIR: path.join(root, '.git'), GIT_WORK_TREE: root, WI072_SOURCE_ONLY_CHILD: '1' };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test', path.join(root, suite)], { cwd: root, encoding: 'utf8', env });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('WI-072 chunked evidence fails closed for tampering, missing chunks, and reordered chunks', t => {
  const tampered = copyEvidence(t);
  const changesChunk = path.join(tampered, 'changes.part-001.json');
  const tamperedChunk = JSON.parse(readFileSync(changesChunk, 'utf8'));
  tamperedChunk[0].file = 'backlog/tampered.md';
  writeFileSync(changesChunk, JSON.stringify(tamperedChunk, null, 2) + '\n');
  assert.throws(() => readChanges(tampered), /hash mismatch/);

  const missing = copyEvidence(t);
  unlinkSync(path.join(missing, 'repair-snapshot.part-003.json'));
  assert.throws(() => readRepairSnapshot(missing), /missing chunk/);

  const reordered = copyEvidence(t);
  const index = path.join(reordered, 'changes.json');
  const value = JSON.parse(readFileSync(index, 'utf8'));
  [value.chunks[0], value.chunks[1]] = [value.chunks[1], value.chunks[0]];
  writeFileSync(index, JSON.stringify(value, null, 2) + '\n');
  assert.throws(() => readChanges(reordered), /chunk order/);
});
