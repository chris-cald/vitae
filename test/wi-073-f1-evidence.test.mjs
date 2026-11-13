import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const record = join(root, 'backlog/records/record-wi-073-f1-intake.md');
const archive = join(root, 'docs/evidence/wi-073-f1');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function files(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return files(join(dir, entry.name), path);
    assert.ok(entry.isFile(), `non-regular archive entry: ${path}`);
    return [path];
  }).sort();
}

test('WI070-F1 intake points to the complete source-matched durable packet', () => {
  const body = readFileSync(record, 'utf8');
  const link = body.match(/\[Durable F1 packet\]\(([^)]+)\)/);
  assert.ok(link, 'durable packet link is missing');
  assert.equal(resolve(dirname(record), link[1]), join(archive, 'README.md'));
  assert.ok(readFileSync(resolve(dirname(record), link[1]), 'utf8'));

  const inventory = readFileSync(join(archive, 'source-inventory.sha256'));
  assert.equal(sha256(inventory), '7348b268e61860fe9b114af6538c7fc013061033029965e02575f5ee0ff48f2c');
  const entries = inventory.toString('utf8').trimEnd().split('\n').map(line => {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    assert.ok(match, `invalid inventory line: ${line}`);
    assert.ok(!match[2].startsWith('/') && !match[2].split('/').includes('..'));
    return { hash: match[1], path: match[2] };
  });
  assert.equal(entries.length, 23);
  assert.deepEqual(files(join(archive, 'packet')), entries.map(entry => entry.path).sort());
  for (const entry of entries) {
    assert.equal(sha256(readFileSync(join(archive, 'packet', entry.path))), entry.hash, entry.path);
  }
});
