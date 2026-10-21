// utils/api.ts
export type MaterialApplicationRecordType =
  | 'submission'
  | 'interview'
  | 'decision'
  | 'follow-up'
  | 'material-change';

interface SourceRef {
  uri?: string;
  locator?: string;
}

interface DraftArtifact {
  name: string;
  path: string;
  markdown: string;
}

interface UnsupportedClaim {
  id: string;
  assessment?: string;
  kind?: string;
  reason: string;
}

export interface ApplicationBundle {
  application: {
    id: string;
    status: string;
  };
  applicationRecords: Array<{
    id: string;
    recordType: MaterialApplicationRecordType;
    occurredAt: string;
    noteIds?: string[];
  }>;
  draftArtifacts: {
    capturedJdNote: DraftArtifact;
    tailoredResumeDraft: DraftArtifact;
    manifest: DraftArtifact;
    sourceSummary: {
      eligibleSourceIds: string[];
      targetSourceRef: SourceRef | null;
      sourceRefs: SourceRef[];
    };
    unsupportedClaims: UnsupportedClaim[];
    nextAction: string;
  };
}

export async function createDraftApplicationBundle(jobFitId: string): Promise<ApplicationBundle> {
  const res = await fetch('/api/v1/application-bundles/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_fit_id: jobFitId }),
  });
  if (!res.ok) throw new Error('Failed to create application bundle');
  return res.json() as Promise<ApplicationBundle>;
}

export async function fetchApplicationBundle(applicationId: string, jobFitId: string): Promise<ApplicationBundle> {
  const res = await fetch(`/api/v1/application-bundles/${applicationId}?job_fit_id=${encodeURIComponent(jobFitId)}`);
  if (!res.ok) throw new Error('Failed to fetch application bundle');
  return res.json() as Promise<ApplicationBundle>;
}

export async function listApplicationBundles(jobFitId: string): Promise<ApplicationBundle[]> {
  const res = await fetch(`/api/v1/application-bundles?job_fit_id=${encodeURIComponent(jobFitId)}`);
  if (!res.ok) throw new Error('Failed to list application bundles');
  return res.json() as Promise<ApplicationBundle[]>;
}

export async function addMaterialApplicationRecord(
  applicationId: string,
  jobFitId: string,
  recordType: MaterialApplicationRecordType,
): Promise<void> {
  const res = await fetch(`/api/v1/application-bundles/${applicationId}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_fit_id: jobFitId, record_type: recordType }),
  });
  if (!res.ok) throw new Error('Failed to record material application event');
}

export async function fetchProfileCategories() {
  const res = await fetch('/api/v1/profile-categories');
  if (!res.ok) throw new Error('Failed to fetch profile categories');
  return res.json();
}

export async function fetchJob(jobId: string) {
  const res = await fetch(`/api/v1/job/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function submitJobFitAnalysis(payload: any) {
  const res = await fetch('/api/v1/job-fit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit job-fit analysis');
  return res.json();
}


export async function fetchJobFitMapping(jobFitId: string) {
  const res = await fetch(`/api/v1/job-fit/${jobFitId}/mapping`);
  if (!res.ok) throw new Error('Failed to fetch mapping');
  return res.json();
}

export async function fetchJobFitFeedback(jobFitId: string) {
  const res = await fetch(`/api/v1/job-fit/${jobFitId}/feedback`);
  if (!res.ok) throw new Error('Failed to fetch feedback');
  return res.json();
}
