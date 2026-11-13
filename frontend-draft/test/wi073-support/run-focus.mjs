// WI-073 focused Chromium probe. Run from any directory; stage contains only the selected build.
import { mkdtemp, mkdir, cp, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const support = path.dirname(fileURLToPath(import.meta.url));
const draft = path.resolve(support, '../..');
const root = path.resolve(draft, '..');
const phase = process.argv[2];
if (!['red', 'green'].includes(phase)) throw Error('Specify red or green');
const sha = b => createHash('sha256').update(b).digest('hex');
const hashes = async dir => Object.fromEntries(await Promise.all((await readdir(dir, {recursive:true, withFileTypes:true})).filter(d=>d.isFile()).map(async d=>{const f=path.join(d.parentPath,d.name);return [path.relative(dir,f),sha(await readFile(f))]})));
const stage = await mkdtemp(path.join(tmpdir(), `vitae-wi073-${phase}-`));
await mkdir(path.join(stage, 'test'));
await cp(path.join(support, 'v3'), path.join(stage, 'test'), {recursive:true});
execFileSync('patch', ['-s', path.join(stage,'test/wi070-product.mjs'), path.join(support,'focus-case.patch')]);
await cp(path.join(draft, 'dist'), path.join(stage, 'dist'), {recursive:true});
const build = await hashes(path.join(draft,'dist')), staged = await hashes(path.join(stage,'dist'));
if (JSON.stringify(build) !== JSON.stringify(staged)) throw Error('stage differs from build');
const {inspectProduct} = await import(pathToFileURL(path.join(stage,'test/wi070-product.mjs')));
const cases = [];
for (const width of [1440,390,480]) for (const input of ['pointer','keyboard']) for (const trigger of ['New application','+ Add']) {
  const r = await inspectProduct({width,height:900,focusCase:{input,trigger}});
  const expected = trigger === '+ Add' ? 'Search applications' : 'Open Catalog Development';
  const served = r.buildReceipt.served.every(x=>r.buildReceipt.hashes[x.path]===x.sha256);
  const expectedMap = Object.fromEntries(Object.entries(staged).map(([name,hash])=>[name==='index.html' ? '/' : `/${name}`,hash]));
  const buildMatches = JSON.stringify(Object.entries(r.buildReceipt.hashes).sort()) === JSON.stringify(Object.entries(expectedMap).sort());
  cases.push({width,input,trigger,focus:r.focusCase,requests:r.requests,proxyRequests:r.proxyRequests,networkVerdict:r.networkVerdict,canaryHits:r.canaryHits,buildReceipt:r.buildReceipt,servedMatches:served,buildMatches,expected});
}
const sourceFiles = ['src/App.tsx','test/connected-dom.test.mjs','test/wi073-support/focus-case.patch','test/wi073-support/run-focus.mjs'];
const sources = Object.fromEntries(await Promise.all(sourceFiles.map(async p=>[p,sha(await readFile(path.join(draft,p)))])));
const diff = execFileSync('git',['diff','--binary'],{cwd:root});
const receipt = {phase,head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sources,diffSha256:sha(diff),stage,build,staged,stageModules:await hashes(path.join(stage,'test')),cases};
const output = path.join(stage, 'receipt.json');
await writeFile(output,JSON.stringify(receipt,null,2)+'\n');
console.log(`receipt: ${output}`);
const failures=cases.filter(c=>!c.focus.section || !c.focus.closed || !c.focus.blocked || !c.focus.restored || (c.input==='keyboard' && !c.focus.focusVisible) || JSON.stringify(c.focus.beforeContext)!==JSON.stringify(c.focus.afterContext) || !c.buildMatches || c.focus.nextTab!==c.expected || JSON.stringify(c.focus.appCounts)!=='[2,2,3]' || JSON.stringify(c.focus.eventCounts)!=='[0,0,1]' || !c.networkVerdict.ok || c.canaryHits.length || !c.buildReceipt.unchanged || !c.servedMatches);
console.log(JSON.stringify({phase,cases:cases.length,failures:failures.map(c=>({width:c.width,input:c.input,trigger:c.trigger,focus:c.focus,expected:c.expected}))}));
if (failures.length) process.exitCode=1;
