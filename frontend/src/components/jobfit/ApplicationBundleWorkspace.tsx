import { useEffect, useRef, useState } from 'react';
import {
  addMaterialApplicationRecord,
  type ApplicationBundle,
  createDraftApplicationBundle,
  fetchApplicationBundle,
  listApplicationBundles,
  type MaterialApplicationRecordType,
} from '@/lib/api';
import { Button } from '@/components/ui/button';

const materialEventTypes: MaterialApplicationRecordType[] = [
  'submission',
  'interview',
  'decision',
  'follow-up',
  'material-change',
];

export function ApplicationBundleWorkspace({ jobFitId }: { jobFitId: string }) {
  const [bundle, setBundle] = useState<ApplicationBundle | null>(null);
  const [bundles, setBundles] = useState<ApplicationBundle[]>([]);
  const [eventType, setEventType] = useState<MaterialApplicationRecordType>('submission');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeJobFitId = useRef(jobFitId);
  activeJobFitId.current = jobFitId;

  useEffect(() => {
    let current = true;
    setBundle(null);
    setBundles([]);
    setEventType('submission');
    setError(null);
    setLoading(true);
    listApplicationBundles(jobFitId)
      .then(existing => {
        if (current) setBundles(existing);
      })
      .catch(() => {
        if (current) setError('Failed to retrieve existing draft bundles.');
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => { current = false; };
  }, [jobFitId]);

  const createOrFetchBundle = async () => {
    const requestedJobFitId = jobFitId;
    setLoading(true);
    setError(null);
    try {
      const created = await createDraftApplicationBundle(requestedJobFitId);
      if (activeJobFitId.current !== requestedJobFitId) return;
      setBundle(created);
      setBundles([created]);
    } catch {
      if (activeJobFitId.current === requestedJobFitId) setError('Failed to create or retrieve the draft bundle.');
    } finally {
      if (activeJobFitId.current === requestedJobFitId) setLoading(false);
    }
  };

  const refreshBundle = async () => {
    if (!bundle) return;
    const requestedJobFitId = jobFitId;
    const applicationId = bundle.application.id;
    setLoading(true);
    setError(null);
    try {
      const refreshed = await fetchApplicationBundle(applicationId, requestedJobFitId);
      if (activeJobFitId.current !== requestedJobFitId) return;
      setBundle(refreshed);
      setBundles(existing => existing.map(item => item.application.id === refreshed.application.id ? refreshed : item));
    } catch {
      if (activeJobFitId.current === requestedJobFitId) setError('Failed to retrieve the draft bundle.');
    } finally {
      if (activeJobFitId.current === requestedJobFitId) setLoading(false);
    }
  };

  const recordMaterialEvent = async () => {
    if (!bundle) return;
    const requestedJobFitId = jobFitId;
    const applicationId = bundle.application.id;
    setLoading(true);
    setError(null);
    try {
      await addMaterialApplicationRecord(applicationId, requestedJobFitId, eventType);
      if (activeJobFitId.current !== requestedJobFitId) return;
      const refreshed = await fetchApplicationBundle(applicationId, requestedJobFitId);
      if (activeJobFitId.current !== requestedJobFitId) return;
      setBundle(refreshed);
      setBundles(existing => existing.map(item => item.application.id === refreshed.application.id ? refreshed : item));
    } catch {
      if (activeJobFitId.current === requestedJobFitId) setError('Failed to record the material event.');
    } finally {
      if (activeJobFitId.current === requestedJobFitId) setLoading(false);
    }
  };

  if (!bundle) {
    return (
      <section className="border rounded-lg p-4 bg-gray-50 space-y-3">
        <h3 className="font-bold">Draft application bundle</h3>
        <p className="text-sm text-gray-600">Generate a guarded draft from this job-fit analysis.</p>
        {bundles.length > 0 && (
          <div className="space-y-1 text-sm">
            <p className="font-medium">Existing draft bundles</p>
            {bundles.map(existing => (
              <Button key={existing.application.id} variant="outline" size="sm" onClick={() => setBundle(existing)} disabled={loading}>
                Reopen existing draft bundle
              </Button>
            ))}
          </div>
        )}
        <Button onClick={createOrFetchBundle} disabled={loading}>
          {loading ? 'Loading...' : 'Create or retrieve draft bundle'}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </section>
    );
  }

  const { draftArtifacts: artifacts } = bundle;
  const files = [
    ['JD note', artifacts.capturedJdNote],
    ['Resume draft', artifacts.tailoredResumeDraft],
    ['Manifest', artifacts.manifest],
  ] as const;

  return (
    <section className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">Draft application bundle</h3>
        <Button variant="outline" size="sm" onClick={refreshBundle} disabled={loading}>Refresh bundle</Button>
      </div>
      <div className="space-y-2">
        {files.map(([label, artifact]) => (
          <details key={artifact.path} className="rounded border bg-white p-2">
            <summary className="cursor-pointer font-medium">{label}: {artifact.name}</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">{artifact.markdown}</pre>
          </details>
        ))}
      </div>
      <div className="text-sm">
        <h4 className="font-semibold">Source summary</h4>
        <p>Eligible sources: {artifacts.sourceSummary.eligibleSourceIds.join(', ') || 'None'}</p>
        <p>Target source: {artifacts.sourceSummary.targetSourceRef?.uri || 'Not recorded'}</p>
      </div>
      <div className="text-sm">
        <h4 className="font-semibold">Unsupported claims</h4>
        {artifacts.unsupportedClaims.length ? (
          <ul className="list-disc pl-5">
            {artifacts.unsupportedClaims.map(claim => <li key={claim.id}>{claim.id}: {claim.reason}</li>)}
          </ul>
        ) : <p>None.</p>}
      </div>
      <p className="text-sm"><span className="font-semibold">Next action:</span> {artifacts.nextAction}</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Material event type"
          className="rounded border px-2 py-1 text-sm"
          value={eventType}
          onChange={event => setEventType(event.target.value as MaterialApplicationRecordType)}
        >
          {materialEventTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <Button size="sm" onClick={recordMaterialEvent} disabled={loading}>Record material event</Button>
      </div>
      {bundle.applicationRecords.length > 0 && (
        <ul className="text-xs text-gray-600">
          {bundle.applicationRecords.map(record => <li key={record.id}>{record.recordType} — {record.occurredAt}</li>)}
        </ul>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </section>
  );
}
