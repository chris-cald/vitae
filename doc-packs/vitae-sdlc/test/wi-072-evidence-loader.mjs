import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const canonical = value => JSON.stringify(value, null, 2) + '\n';

function readChunkedArray(directory, indexFile, expectedPrefix) {
  const index = JSON.parse(readFileSync(path.join(directory, indexFile), 'utf8'));
  if (index.format !== 'wi-072-chunked-evidence-v1') throw Error(`${indexFile}: unsupported evidence format`);
  if (!Array.isArray(index.chunks) || !Number.isInteger(index.record_count)) throw Error(`${indexFile}: invalid chunk index`);
  const rows = [];
  for (let offset = 0; offset < index.chunks.length; offset += 1) {
    const chunk = index.chunks[offset];
    const expectedFile = `${expectedPrefix}.part-${String(offset + 1).padStart(3, '0')}.json`;
    if (chunk.file !== expectedFile || path.basename(chunk.file) !== chunk.file || chunk.position !== offset + 1) throw Error(`${indexFile}: chunk order or path is invalid`);
    let source;
    try { source = readFileSync(path.join(directory, chunk.file), 'utf8'); }
    catch (error) { if (error?.code === 'ENOENT') throw Error(`${indexFile}: missing chunk ${chunk.file}`); throw error; }
    if (sha256(source) !== chunk.sha256) throw Error(`${indexFile}: chunk hash mismatch for ${chunk.file}`);
    const values = JSON.parse(source);
    if (!Array.isArray(values) || values.length !== chunk.count) throw Error(`${indexFile}: invalid chunk count for ${chunk.file}`);
    rows.push(...values);
  }
  if (rows.length !== index.record_count) throw Error(`${indexFile}: record count mismatch`);
  return { index, rows };
}
function verifyCanonical(indexFile, index, value) {
  const source = canonical(value);
  if (Buffer.byteLength(source) !== index.canonical_bytes || sha256(source) !== index.canonical_sha256) throw Error(`${indexFile}: canonical payload hash mismatch`);
  return value;
}
export function readChanges(directory) {
  const { index, rows } = readChunkedArray(directory, 'changes.json', 'changes');
  return verifyCanonical('changes.json', index, rows);
}
export function readRepairSnapshot(directory) {
  const { index, rows } = readChunkedArray(directory, 'repair-snapshot.json', 'repair-snapshot');
  return verifyCanonical('repair-snapshot.json', index, { repair_commit: index.repair_commit, repair_tree: index.repair_tree, original_manifest_sha256: index.original_manifest_sha256, generation: index.generation, files: rows });
}
