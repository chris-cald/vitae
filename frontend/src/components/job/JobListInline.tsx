import { useEffect, useState } from 'react';
import { EditableName } from '@/components/ui/EditableName';
import { Button } from '@/components/ui/button';
import { TrashIcon } from '@/components/ui/TrashIcon';
import { JsonThumbnail } from '@/components/ui/JsonThumbnail';

export interface JobListInlineProps {
  onSelect?: (id: string) => void;
  selectedId?: string;
}

interface Job {
  job_id: string;
  name?: string;
  title?: string;
  company?: string;
  [key: string]: any;
}

export function JobListInline({ onSelect, selectedId }: JobListInlineProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  // Editing state now handled by EditableName
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/job')
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ul className="divide-y">
      {jobs.map(j => {
        return (
          <li
            key={j.job_id}
            className={`py-2 px-2 cursor-pointer rounded ${selectedId === j.job_id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
            onClick={() => onSelect && onSelect(j.job_id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <EditableName
                name={j.name || (j.title ? `${j.title}${j.company ? ' @ ' + j.company : ''}` : j.job_id)}
                onSave={async (newName) => {
                  await fetch(`/api/v1/job/${j.job_id}/name`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName }),
                  });
                  setJobs(list => list.map(x => x.job_id === j.job_id ? { ...x, name: newName } : x));
                }}
                className="flex-1 min-w-0"
                textClassName="font-semibold text-base truncate max-w-[180px]"
                inputClassName="text-base font-semibold"
                iconSize="w-4 h-4"
              />
              <JsonThumbnail data={j} fields={["title", "company"]} className="ml-2" />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete job"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this job? This cannot be undone.')) {
                    await fetch(`/api/v1/job/${j.job_id}`, { method: 'DELETE' });
                    setJobs(list => list.filter(x => x.job_id !== j.job_id));
                  }
                }}
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </li>
        );
      })}
      {loading && <li className="text-xs text-gray-400">Loading...</li>}
    </ul>
  );
}
