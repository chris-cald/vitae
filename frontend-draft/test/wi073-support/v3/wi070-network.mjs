export function matchesCanaryConnect(event, authority) {
  return event.allowed === false && event.method === 'CONNECT' && event.url === authority;
}

export function networkVerdict({cdp, proxy, canaryHits, expectedDenials = []}) {
  const expected = event => expectedDenials.some(e => e.method === event.method && (e.url !== undefined ? e.url === event.url : e.path === event.path));
  const unexpected = [...cdp, ...proxy].filter(event => !event.allowed && !expected(event));
  return Object.freeze({ok: canaryHits.length === 0 && unexpected.length === 0, unexpected: Object.freeze(unexpected)});
}

export function allowStaticRequest({ origin, paths }, method, address) {
  try {
    const url = new URL(address);
    return method === 'GET' && url.origin === origin && !url.username && !url.password && !url.search && !url.hash && paths.includes(url.pathname);
  } catch {
    return false;
  }
}
