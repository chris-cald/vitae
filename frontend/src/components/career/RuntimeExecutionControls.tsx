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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <section aria-label={`${label} runtime controls`} className="space-y-2 text-sm">
      <h4 className="font-semibold">{label}</h4>
      {!execution ? <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => startRuntimeExecution(workflowType))}>Start {label}</button> : <>
        <p>Execution: {execution.execution_id} · {execution.status_code}</p>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => fetchRuntimeExecution(execution.execution_id))}>Refresh status</button>
          {execution.status_code === 'accepted' && <>
            <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => cancelRuntimeExecution(execution.execution_id))}>Cancel execution</button>
            <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => decideRuntimeExecution(execution.execution_id, 'approve'))}>Approve</button>
            <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void run(() => decideRuntimeExecution(execution.execution_id, 'reject'))}>Reject</button>
          </>}
        </div>
      </>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
    </section>
  );
}
