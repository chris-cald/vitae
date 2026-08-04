import { useEffect, useState } from 'react';
import { EditableName } from '@/components/ui/EditableName';
import { TrashIcon } from '@/components/ui/TrashIcon';
import { Button } from '@/components/ui/button';
import { JsonThumbnail } from '@/components/ui/JsonThumbnail';

export interface ResumeListInlineProps {
  onSelect?: (id: string) => void;
  selectedId?: string;
}

interface Resume {
  resume_id: string;
  name?: string;
  [key: string]: any;
}

export function ResumeListInline({ onSelect, selectedId }: ResumeListInlineProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  // Editing state now handled by EditableName
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/resume')
      .then(res => res.json())
      .then(data => setResumes(data.resumes || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ul className="divide-y">
      {resumes.map(r => {
        return (
          <li
            key={r.resume_id}
            className={`py-2 px-2 cursor-pointer rounded ${selectedId === r.resume_id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
            onClick={() => onSelect && onSelect(r.resume_id)}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <EditableName
                name={r.name || r.resume_id}
                onSave={async (newName) => {
                  await fetch(`/api/v1/resume/${r.resume_id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName }),
                  });
                  setResumes(list => list.map(x => x.resume_id === r.resume_id ? { ...x, name: newName } : x));
                }}
                className="min-w-0 mb-1"
                textClassName="font-semibold text-base truncate max-w-[180px]"
                inputClassName="text-base font-semibold"
                iconSize="w-4 h-4"
              />
              <div className="flex items-center gap-2 min-w-0">
                <JsonThumbnail data={r} className="ml-0" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete resume"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this resume? This cannot be undone.')) {
                      await fetch(`/api/v1/resume/${r.resume_id}`, { method: 'DELETE' });
                      setResumes(list => list.filter(x => x.resume_id !== r.resume_id));
                    }
                  }}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
      {loading && <li className="text-xs text-gray-400">Loading...</li>}
    </ul>
  );
}
