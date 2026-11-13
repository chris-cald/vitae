import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readdir, readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allowStaticRequest, matchesCanaryConnect, networkVerdict } from './wi070-network.mjs';
import { childLifecycle } from './wi070-lifecycle.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const chromium = '/Users/macos/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell';

export async function inspectProduct({ width, height, screenshot, blockedScreenshot, probeDenied = false, creationCancel = false, keyboardCancel = false, isolationCanaries = false } = {}) {
  const assets = await readdir(path.join(root, 'assets'));
  const files = new Map([['/', 'index.html'], ...assets.map(name => [`/assets/${name}`, `assets/${name}`])]);
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
  const buildBytes = new Map(await Promise.all([...files].map(async ([url, name]) => [url, await readFile(path.join(root, name))])));
  const buildHashes = Object.fromEntries([...buildBytes].map(([url, bytes]) => [url, sha256(bytes)]));
  const served = [];
  const canaryHits = [];
  const canary = createServer((req, res) => { canaryHits.push({method:req.method, path:req.url}); res.writeHead(204).end(); });
  canary.on('upgrade', (req, socket) => { canaryHits.push({method:'UPGRADE', path:req.url}); socket.destroy(); });
  await new Promise(resolve => canary.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${canary.address().port}`;
  const policy = { origin, paths: [...files.keys()] };
  const proxyRequests = [];
  const observers = new Set();
  const recordProxy = event => { proxyRequests.push(event); for (const observer of observers) observer(event); };
  const server = createServer(async (req, res) => {
    const allowed = allowStaticRequest(policy, req.method, req.url);
    recordProxy({method:req.method, url:req.url, allowed});
    if (!allowed) { res.writeHead(403).end(); return; }
    const name = files.get(new URL(req.url).pathname);
    try {
      const type = name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html';
      const bytes = buildBytes.get(new URL(req.url).pathname);
      served.push({path:new URL(req.url).pathname, sha256:sha256(bytes)});
      res.writeHead(200, { 'content-type': type, 'cache-control':'no-store' }); res.end(bytes);
    } catch { res.writeHead(500).end(); }
  });
  server.on('connect', (req, socket) => { recordProxy({method:'CONNECT', url:req.url, allowed:false}); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); });
  server.on('upgrade', (req, socket) => { recordProxy({method:'UPGRADE',url:req.url,allowed:false}); socket.destroy(); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const profile = await mkdtemp(path.join(tmpdir(), 'vitae-wi070-profile-'));
  const browser = spawn(chromium, ['--headless','--no-sandbox','--disable-gpu','--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--disable-extensions','--disable-popup-blocking','--disable-quic','--force-webrtc-ip-handling-policy=disable_non_proxied_udp',`--proxy-server=http://127.0.0.1:${server.address().port}`,'--proxy-bypass-list=<-loopback>','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1','--remote-debugging-pipe',`--user-data-dir=${profile}`], { stdio: ['ignore','ignore','ignore','pipe','pipe'] });
  const lifecycle = childLifecycle(browser);
  let serial = 0, buffer = '', session;
  const pending = new Map(), requests = [];
  const send = (method, params = {}, target = session) => new Promise((resolve, reject) => {
    const id = ++serial; pending.set(id, {resolve,reject});
    browser.stdio[3].write(JSON.stringify({id, method, params, ...(target ? {sessionId: target} : {})}) + '\0');
  });
  let loadedResolve;
  const loaded = new Promise(resolve => { loadedResolve = resolve; });
  browser.stdio[4].on('data', data => {
    buffer += data;
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const msg = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
      if (msg.id) { const p = pending.get(msg.id); pending.delete(msg.id); if (msg.error) p?.reject(Error(msg.error.message)); else p?.resolve(msg.result); }
      else if (msg.method === 'Fetch.requestPaused') {
        const req = msg.params.request;
        const allowed = allowStaticRequest(policy, req.method, req.url);
        let pathname; try { pathname = new URL(req.url).pathname; } catch { pathname = '<invalid>'; }
        requests.push({method:req.method, path:pathname, resourceType:msg.params.resourceType, allowed});
        void send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', allowed ? {requestId:msg.params.requestId} : {requestId:msg.params.requestId,errorReason:'BlockedByClient'}, msg.sessionId);
      } else if (msg.method === 'Page.loadEventFired') loadedResolve();
    }
  });
  const fail = error => { for (const p of pending.values()) p.reject(error); pending.clear(); };
  browser.on('error', fail); browser.on('exit', () => fail(Error('Chromium exited')));
  let outcome;
  try {
    const target = await send('Target.createTarget', {url:'about:blank'}, null);
    ({sessionId:session} = await send('Target.attachToTarget', {targetId:target.targetId,flatten:true}, null));
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    if (!isolationCanaries) {
      await send('Network.setBypassServiceWorker', {bypass:true});
      await send('Fetch.enable', {patterns:[{urlPattern:'*',requestStage:'Request'}]});
    }
    await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate', {url:origin + '/'}); await lifecycle.waitFor(loaded);
    const result = await send('Runtime.evaluate', {expression:'document.body.innerText', returnByValue:true});
    let creationResult;
    if (creationCancel) {
      const evaluate = async expression => {
        const value = await send('Runtime.evaluate', {expression, returnByValue:true});
        if (value.exceptionDetails) throw Error(value.exceptionDetails.text);
        return value.result.value;
      };
      const click = async label => {
        const coordinates = await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!b)throw Error('missing button');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;if(document.elementFromPoint(x,y)!==b)throw Error('button is not hit target');return {x,y}})()`);
        await send('Input.dispatchMouseEvent', {type:'mousePressed',...coordinates,button:'left',clickCount:1});
        await send('Input.dispatchMouseEvent', {type:'mouseReleased',...coordinates,button:'left',clickCount:1});
      };
      await click('New application'); await click('Confirm creation');
      const blocked = await evaluate("document.querySelector('[role=alert]')?.textContent.includes('Target title and requirements are required') === true");
      if (blockedScreenshot) { const shot = await send('Page.captureScreenshot', {format:'png'}); await writeFile(blockedScreenshot, shot.data, 'base64'); }
      await click('Cancel creation');
      const closed = await evaluate("!document.querySelector('[aria-label=\"Create synthetic Target\"]')");
      creationResult = {blocked, closed};
    }
    let keyboardResult;
    if (keyboardCancel) {
      const key = async (name, code, value) => {
        const event = {key:name,code,windowsVirtualKeyCode:value,nativeVirtualKeyCode:value};
        await send('Input.dispatchKeyEvent', {type:'keyDown',...event, ...(name === 'Enter' ? {text:'\r'} : {})});
        await send('Input.dispatchKeyEvent', {type:'keyUp',...event});
      };
      const active = async () => (await send('Runtime.evaluate', {expression:"document.activeElement?.textContent?.trim() || document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName",returnByValue:true})).result.value;
      const seek = async label => {
        const seen = [];
        for (let i=0;i<60;i++) { const current = await active(); seen.push(current); if (current === label) return; await key('Tab','Tab',9); }
        throw Error(`keyboard could not reach ${label}; focus sequence ${JSON.stringify(seen)}`);
      };
      await seek('New application'); await key('Enter','Enter',13);
      const opened = (await send('Runtime.evaluate', {expression:"!!document.querySelector('[aria-label=\"Create synthetic Target\"]')",returnByValue:true})).result.value;
      await seek('Cancel creation'); await key('Enter','Enter',13);
      const after = await active();
      const closed = (await send('Runtime.evaluate', {expression:"!document.querySelector('[aria-label=\"Create synthetic Target\"]')",returnByValue:true})).result.value;
      keyboardResult = {opened,closed,focusAfterCancel:after};
    }
    let probeFailed;
    if (probeDenied) {
      const probe = await send('Runtime.evaluate', {expression:"fetch('/api/probe').then(() => false, () => true)", awaitPromise:true, returnByValue:true});
      probeFailed = probe.result.value;
    }
    let canaries;
    if (isolationCanaries) {
      canaries = {};
      const probes = {
        fetch: "fetch('/canary/fetch').catch(()=>{})",
        xhr: "(()=>{const x=new XMLHttpRequest();x.open('GET','/canary/xhr');x.send()})()",
        websocket: `new WebSocket(${JSON.stringify(origin.replace('http:', 'ws:') + '/canary/websocket')})`,
        eventsource: "new EventSource('/canary/eventsource')",
        beacon: "navigator.sendBeacon('/canary/beacon','synthetic')",
        worker: "new Worker('/canary/worker')",
        serviceworker: "navigator.serviceWorker.register('/canary/serviceworker').catch(()=>{})",
        iframe: "(()=>{const e=document.createElement('iframe');e.src='/canary/iframe';document.body.append(e)})()",
        popup: "window.open('/canary/popup','canary')",
        navigation: "location.assign('/canary/navigation')",
      };
      for (const [type, expression] of Object.entries(probes)) {
        const observed = new Promise(resolve => {
          const observer = event => {
            if (!event.allowed && (event.url.includes(`/canary/${type}`) || (type === 'websocket' && matchesCanaryConnect(event, new URL(origin).host)))) {
              clearTimeout(timer); observers.delete(observer); resolve(event);
            }
          };
          const timer = setTimeout(() => { observers.delete(observer); resolve(null); }, 3000);
          observers.add(observer);
        });
        const launched = await send('Runtime.evaluate', {expression:`void (${expression}); true`, returnByValue:true});
        if (launched.exceptionDetails) throw Error(`canary ${type}: ${launched.exceptionDetails.text}`);
        const event = await observed;
        canaries[type] = event && canaryHits.length === 0 ? 'blocked' : 'unproven';
      }
    }
    if (screenshot) { const shot = await send('Page.captureScreenshot', {format:'png'}); await writeFile(screenshot, shot.data, 'base64'); }
    outcome = {text:result.result.value, origin, profile, probeFailed, creationCancel:creationResult, keyboardCancel:keyboardResult, canaries};
  } finally {
    try {
      await lifecycle.finish();
    } finally {
      await Promise.all([server, canary].map(s => new Promise((resolve, reject) => s.close(error => error ? reject(error) : resolve()))));
    }
  }
  const snapshot = items => Object.freeze(items.map(item => Object.freeze({...item})));
  const finalRequests = snapshot(requests), finalProxy = snapshot(proxyRequests), finalHits = snapshot(canaryHits);
  const expectedDenials = [];
  if (probeDenied) expectedDenials.push({method:'GET',path:'/api/probe'});
  if (isolationCanaries) {
    for (const type of ['fetch','xhr','eventsource','worker','serviceworker','iframe','popup','navigation']) expectedDenials.push({method:'GET',url:`${origin}/canary/${type}`});
    expectedDenials.push({method:'POST',url:`${origin}/canary/beacon`}, {method:'CONNECT',url:new URL(origin).host});
  }
  const finalHashes = Object.fromEntries(await Promise.all([...files].map(async ([url, name]) => [url, sha256(await readFile(path.join(root, name)))])));
  const buildReceipt = Object.freeze({hashes:Object.freeze(buildHashes), served:snapshot(served), unchanged:JSON.stringify(buildHashes) === JSON.stringify(finalHashes)});
  return Object.freeze({...outcome, requests:finalRequests, proxyRequests:finalProxy, canaryHits:finalHits, networkVerdict:networkVerdict({cdp:finalRequests, proxy:finalProxy, canaryHits:finalHits, expectedDenials}), buildReceipt, canaryEvidence:'request-attempt proxy denials only; active worker execution not established'});
}
