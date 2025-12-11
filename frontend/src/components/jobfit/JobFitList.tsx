

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EditableName } from '@/components/ui/EditableName';
import { TrashIcon } from '@/components/ui/TrashIcon';
import { JsonThumbnail } from '@/components/ui/JsonThumbnail';



interface Resume {
    resume_id: string;
    basics?: { name?: string; label?: string };
}

interface Job {
  job_id: string;
  title?: string;
  company?: string;
}

interface JobFit {
  id: string;
  resume_id?: string;

  job_id?: string;
  [key: string]: any;
}

interface JobFitListProps {
  onSelect: (id: string) => void;
  selectedId?: string;
}

export function JobFitList({ onSelect, selectedId }: JobFitListProps) {
  const [jobFits, setJobFits] = useState<JobFit[]>([]);
  const [resumeMap, setResumeMap] = useState<Record<string, Resume>>({});
  const [jobMap, setJobMap] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  // Editing state now handled by EditableName
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/v1/job-fit?limit=${limit}&offset=${page * limit}`)
      .then(res => res.json())
      .then(async (data) => {
        setJobFits(data);
        // Collect unique resume and job IDs
        const resumeIds = Array.from(new Set(data.map((jf: JobFit) => jf.resume_id).filter(Boolean)));
        const jobIds = Array.from(new Set(data.map((jf: JobFit) => jf.job_id).filter(Boolean)));
        // Fetch resumes
        const resumeResults = await Promise.all(resumeIds.map(id =>
          fetch(`/api/v1/resume/${id}`).then(r => r.json()).then(r => ({ id, resume: r.resume })).catch(() => ({ id, resume: null }))
        ));
        const jobResults = await Promise.all(jobIds.map(id =>
          fetch(`/api/v1/job/${id}`).then(r => r.json()).then(r => ({ id, job: r.job })).catch(() => ({ id, job: null }))
        ));
        const resumeMapObj: Record<string, Resume> = {};
        resumeResults.forEach((item) => { const id = String(item.id); if (item.resume) resumeMapObj[id] = item.resume; });
        setResumeMap(resumeMapObj);
        const jobMapObj: Record<string, Job> = {};
        jobResults.forEach((item) => { const id = String(item.id); if (item.job) jobMapObj[id] = item.job; });
        setJobMap(jobMapObj);
      })
      .catch(() => setError('Failed to load job-fit analyses.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Previous Analyses</span>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
          <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={jobFits.length < limit}>Next</Button>
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <ul className="divide-y divide-gray-200">
        {jobFits.map(jf => {
          const resume = jf.resume_id ? resumeMap[jf.resume_id] : null;
          const job = jf.job_id ? jobMap[jf.job_id] : null;
          return (
            <li key={jf.id} className={`py-2 px-2 cursor-pointer rounded ${selectedId === jf.id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`} onClick={() => onSelect(jf.id)}>
              <div className="flex items-center gap-2 min-w-0">
                <EditableName
                  name={jf.name || jf.id}
                  onSave={async (newName) => {
                    await fetch(`/api/v1/job-fit/${jf.id}/name`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName }),
                    });
                    setJobFits(fits => fits.map(f => f.id === jf.id ? { ...f, name: newName } : f));
                  }}
                  className="flex-1 min-w-0"
                  textClassName="font-semibold text-base truncate max-w-[180px]"
                  inputClassName="text-base font-semibold"
                  iconSize="w-4 h-4"
                />
                 <JsonThumbnail data={jf} fields={["resume_id", "job_id"]} className="ml-2" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete job-fit analysis"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this job-fit analysis? This cannot be undone.')) {
                      await fetch(`/api/v1/job-fit/${jf.id}`, { method: 'DELETE' });
                      setJobFits(list => list.filter(x => x.id !== jf.id));
                    }
                  }}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Resume: {resume?.basics?.name || resume?.basics?.label || jf.resume_id}
                {' | '}
                Job: {(job?.title ? `${job.title}${job.company ? ' @ ' + job.company : ''}` : jf.job_id)}
              </div>
            </li>
          );
        })}
        {(!loading && jobFits.length === 0) && <li className="text-xs text-gray-400">No analyses found.</li>}
      </ul>
    </div>
  );
}
