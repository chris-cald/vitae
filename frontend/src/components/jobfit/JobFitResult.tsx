

import { useEffect, useState } from 'react';
import { EditableName } from '@/components/ui/EditableName';

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
  id?: string;
  resume_id?: string;
  job_id?: string;
  links?: Array<{ rel: string; href: string }>;
  [key: string]: any;
}
interface ScoreResult {
  score?: number;
  links?: Array<{ rel: string; href: string }>;
}
interface FeedbackItem {
  intent: string;
  message: string;
  lineNumber?: string;
}

export function JobFitResult({ jobFitId }: { jobFitId: string }) {
  const [result, setResult] = useState<JobFit | null>(null);
  // Editing state now handled by EditableName
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[] | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobFitId) return;
    setError(null);
    setLoading(true);
    let fit: JobFit | null = null;
    let score: ScoreResult | null = null;
    let feedback: FeedbackItem[] = [];
    let resumeId = '';
    let jobId = '';
    Promise.all([
      fetch(`/api/v1/job-fit/${jobFitId}`),
      fetch(`/api/v1/job-fit/${jobFitId}/score`),
      fetch(`/api/v1/job-fit/${jobFitId}/feedback`),
    ])
      .then(async ([fitRes, scoreRes, feedbackRes]) => {
        if (!fitRes.ok) throw new Error('JobFit not found');
        fit = await fitRes.json();
        score = scoreRes.ok ? await scoreRes.json() : null;
        feedback = feedbackRes.ok ? await feedbackRes.json() : [];
        setResult(fit);
        setScore(score);
        setFeedback((feedback && feedback.length > 0) ? feedback : (fit.feedback || []));
        resumeId = fit.resume_id;
        jobId = fit.job_id;
        // Fetch user-friendly resume and job
        if (resumeId) fetch(`/api/v1/resume/${resumeId}`).then(r => r.json()).then(r => setResume(r.resume)).catch(() => setResume(null));
        if (jobId) fetch(`/api/v1/job/${jobId}`).then(r => r.json()).then(r => setJob(r.job)).catch(() => setJob(null));
      })
      .catch(() => setError('Failed to fetch results.'))
      .finally(() => setLoading(false));
  }, [jobFitId]);

  if (!jobFitId) return <div className="text-gray-400 text-sm">Select a job-fit analysis to view results.</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {result && (
        <div className="border rounded-xl p-6 bg-white w-full shadow-lg flex flex-col gap-4" style={{ minHeight: 400 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1 flex items-center min-w-0">
              {result && (
                <EditableName
                  name={result.name || result.id || 'Job-Fit Analysis'}
                  onSave={async (newName) => {
                    if (!result.id) return;
                    await fetch(`/api/v1/job-fit/${result.id}/name`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName }),
                    });
                    setResult({ ...result, name: newName });
                  }}
                  className="flex-1 min-w-0"
                  textClassName="font-bold text-2xl truncate max-w-[320px]"
                  inputClassName="text-2xl font-bold"
                  iconSize="w-5 h-5"
                />
              )}
            </div>
            {score && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">Score:</span>
                <span className="text-3xl font-mono text-primary">{score.score ?? Math.round((result.score || 0) * 100)}</span>
                <span className="text-gray-500">/ 100</span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Resume:</span> {resume?.basics?.name || resume?.basics?.label || result.resume_id}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Job:</span> {job?.title ? `${job.title}${job.company ? ' @ ' + job.company : ''}` : result.job_id}
              </div>
              {result.analysis && (
                <div>
                  <span className="font-semibold">Summary:</span>
                  <div className="bg-gray-50 rounded p-2 mt-1 text-base whitespace-pre-line">{result.analysis}</div>
                </div>
              )}
              {result.keywords && result.keywords.length > 0 && (
                <div>
                  <span className="font-semibold">Keywords:</span>
                  <span className="ml-2 text-xs">{result.keywords.join(', ')}</span>
                </div>
              )}
              {result.skills && result.skills.length > 0 && (
                <div>
                  <span className="font-semibold">Skills:</span>
                  <ul className="ml-4 list-disc text-xs">
                    {result.skills.map((s: any, i: number) => (
                      <li key={i}>{s.name} <span className="text-gray-500">({Math.round((s.score || 0) * 100)}%)</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {result.created_at && (
                <div className="text-xs text-gray-400">Created: {result.created_at}</div>
              )}
            </div>
            <div className="flex-1">
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[180px]">
                <h4 className="font-bold mb-2">Feedback</h4>
                {feedback && feedback.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {feedback.map((item, i) => (
                      <li key={i} className="mb-1">
                        <span className="font-semibold capitalize">{item.intent}:</span> {item.message}
                        {item.lineNumber && <span className="text-xs text-gray-500 ml-2">(Line {item.lineNumber})</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-400">No feedback available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
