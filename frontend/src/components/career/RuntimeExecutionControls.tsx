import { useEffect, useState } from 'react';
import {
  cancelRuntimeExecution,
  decideRuntimeExecution,
  fetchRuntimeExecution,
  startRuntimeExecution,
  type RuntimeExecution,
  type RuntimeWorkflowType,
} from '@/lib/api';

async function authorizationScope(authorization: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(authorization));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

const executionStorageKey = (workflowType: RuntimeWorkflowType, scope: string) => `runtime-execution:${workflowType}:${scope}`;

export function RuntimeExecutionControls({ workflowType, label }: {
  workflowType: RuntimeWorkflowType;
  label: string;
}) {
  const [execution, setExecution] = useState<RuntimeExecution | null>(null);
  const [authorization, setAuthorization] = useState('');
  const [pendingStart, setPendingStart] = useState<{ scope: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const terminal = execution !== null && ['completed', 'cancelled', 'rejected', 'retryable-failure', 'permanent-failure'].includes(execution.status_code);

  useEffect(() => {
    let current = true;
    if (!authorization) {
      setExecution(null);
      return () => { current = false; };
    }
    setExecution(null);
    void (async () => {
      const scope = await authorizationScope(authorization);
      const executionId = sessionStorage.getItem(executionStorageKey(workflowType, scope));
      if (!executionId) return;
      try {
        const restored = await fetchRuntimeExecution(executionId, authorization);
        if (current) setExecution(restored);
      } catch {
        if (current) setExecution(null);
      }
    })();
    return () => { current = false; };
  }, [authorization, workflowType]);

  const run = async (action: () => Promise<RuntimeExecution>) => {
    setBusy(true);
    try {
      setExecution(await action());
      setError('');
    } catch {
      setError('Runtime execution is unavailable.');
    } finally {
      setBusy(false);
    }
  };

  const start = () => {
    void (async () => {
      setBusy(true);
      try {
        const scope = await authorizationScope(authorization);
        const storageKey = `runtime-start:${workflowType}:${scope}`;
        const idempotencyKey = pendingStart?.scope === scope
          ? pendingStart.key
          : sessionStorage.getItem(storageKey) ?? `idem_${crypto.randomUUID()}`;
        setPendingStart({ scope, key: idempotencyKey });
        sessionStorage.setItem(storageKey, idempotencyKey);
        const started = await startRuntimeExecution(workflowType, authorization, idempotencyKey);
        sessionStorage.setItem(executionStorageKey(workflowType, scope), started.execution_id);
        setExecution(started);
        setPendingStart(null);
        sessionStorage.removeItem(storageKey);
        setError('');
      } catch {
        setError('Runtime execution is unavailable.');
      } finally {
        setBusy(false);
      }
    })();
  };

  return (
    <section aria-label={`${label} runtime controls`} className="space-y-2 text-sm">
      <h4 className="font-semibold">{label}</h4>
      <label className="block">
        Runtime authorization token
        <input
          aria-label="Runtime authorization token"
          autoComplete="off"
          className="ml-2 rounded border px-2 py-1"
          onChange={event => { setAuthorization(event.target.value); setError(''); }}
          type="password"
          value={authorization}
        />
      </label>
      {(!execution || terminal) && <button disabled={busy || !authorization} className="px-3 py-1 rounded bg-secondary" onClick={start}>Start {label}</button>}
      {execution && <>
        <p>Execution: {execution.execution_id} · {execution.status_code}</p>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => fetchRuntimeExecution(execution.execution_id, authorization))}>Refresh status</button>
          {execution.status_code === 'accepted' && <>
            <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => cancelRuntimeExecution(execution.execution_id, authorization))}>Cancel execution</button>
            <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => decideRuntimeExecution(execution.execution_id, 'approve', authorization))}>Approve</button>
            <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => decideRuntimeExecution(execution.execution_id, 'reject', authorization))}>Reject</button>
          </>}
        </div>
      </>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
    </section>
  );
}
