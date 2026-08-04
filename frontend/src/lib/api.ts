// utils/api.ts
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
