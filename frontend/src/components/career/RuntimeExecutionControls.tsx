import { useState } from 'react';
import {
  cancelRuntimeExecution,
  decideRuntimeExecution,
  fetchRuntimeExecution,
  startRuntimeExecution,
  type RuntimeExecution,
  type RuntimeWorkflowType,
} from '@/lib/api';

export function RuntimeExecutionControls({ workflowType, label }: {
  workflowType: RuntimeWorkflowType;
  label: string;
}) {
  const [execution, setExecution] = useState<RuntimeExecution | null>(null);
  const [authorization, setAuthorization] = useState('');
  const storageKey = `runtime-start:${workflowType}`;
  const [startIdempotencyKey, setStartIdempotencyKey] = useState<string | null>(sessionStorage.getItem(storageKey));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const terminal = execution !== null && execution.status_code !== 'accepted';

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
    const idempotencyKey = startIdempotencyKey ?? `idem_${crypto.randomUUID()}`;
    setStartIdempotencyKey(idempotencyKey);
    sessionStorage.setItem(storageKey, idempotencyKey);
    void run(async () => {
      const next = await startRuntimeExecution(workflowType, authorization, idempotencyKey);
      setStartIdempotencyKey(null);
      sessionStorage.removeItem(storageKey);
      return next;
    });
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
          onChange={event => setAuthorization(event.target.value)}
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
