export function childLifecycle(child) {
  let failure, stopping = false, closed = false;
  let resolveFailure, resolveClose;
  const failed = new Promise(resolve => { resolveFailure = resolve; });
  const terminated = new Promise(resolve => { resolveClose = resolve; });
  function record(error) {
    if (!failure) { failure = error; resolveFailure(error); }
  }
  child.on('error', error => {
    record(error);
    if (child.pid == null) { closed = true; resolveClose(); }
  });
  child.on('exit', () => { if (!stopping) record(new Error('Chromium exited unexpectedly')); });
  child.on('close', () => {
    closed = true;
    if (!stopping) record(new Error('Chromium closed unexpectedly'));
    resolveClose();
  });
  return Object.freeze({
    waitFor: promise => Promise.race([promise, failed.then(error => { throw error; })]),
    async finish() {
      stopping = true;
      if (!closed && child.pid != null && child.exitCode === null && child.signalCode === null) {
        try { child.kill(); } catch (error) { record(error); }
      }
      await terminated;
      if (failure) throw failure;
    },
  });
}
