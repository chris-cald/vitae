import { useState, useEffect, FormEvent } from 'react';
import { JobFitCategorySelector } from './JobFitCategorySelector';
import { Button } from '@/components/ui/button';
import { PencilIcon } from '@/components/ui/PencilIcon';
import { submitJobFitAnalysis, fetchJobFitMapping, fetchJobFitFeedback } from '@/lib/api';

export interface JobFitCreateResponse {
  id?: string;
  message?: string;
}


export interface JobFitCreateProps {
  onCreated?: (data: JobFitCreateResponse) => void;
  resumeId?: string;
  jobId?: string;
  onEditResume?: () => void;
  onEditJob?: () => void;
}


interface ResumeListItem {
  resume_id: string;
  [key: string]: any;
}
interface JobListItem {
  job_id: string;
  [key: string]: any;
}

export function JobFitCreate({ onCreated, resumeId: propResumeId, jobId: propJobId, onEditResume, onEditJob }: JobFitCreateProps) {
  const [resumeId, setResumeId] = useState<string>(propResumeId || '');
  const [jobId, setJobId] = useState<string>(propJobId || '');
    // If props change, update local state
    useEffect(() => {
      if (propResumeId) setResumeId(propResumeId);
    }, [propResumeId]);
    useEffect(() => {
      if (propJobId) setJobId(propJobId);
    }, [propJobId]);
  const [name, setName] = useState<string>('');
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<any>(null);
  const [jobFit, setJobFit] = useState<any>(null);
  const [mapping, setMapping] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resumesRes, jobsRes] = await Promise.all([
          fetch('/api/v1/resume'),
          fetch('/api/v1/job'),
        ]);
        const resumesData = await resumesRes.json();
        const jobsData = await jobsRes.json();
        setResumes(resumesData.resumes || []);
        setJobs(jobsData.jobs || []);
      } catch {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepopulate name when resume or job changes
  useEffect(() => {
    const resume = resumes.find(r => r.resume_id === resumeId);
    const job = jobs.find(j => j.job_id === jobId);
    let defaultName = '';
    if (resume && job) {
      defaultName = `${resume.name || resume.resume_id} + ${job.name || job.job_id}`;
    } else if (resume) {
      defaultName = resume.name || resume.resume_id;
    } else if (job) {
      defaultName = job.name || job.job_id;
    }
    setName(defaultName);
  }, [resumeId, jobId, resumes, jobs]);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!resumeId || !jobId) {
      setError('Both Resume and Job are required.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide a name for the analysis.');
      return;
    }
    if (!selectedCategories) {
      setError('Please select targeting criteria.');
      return;
    }
    setCreating(true);
    try {
      // Create job fit (mapping is created automatically)
      const payload: any = { resume_id: resumeId, job_id: jobId, name };
      if (selectedCategories) payload.profile_categories = selectedCategories;
      const jobFitRes = await submitJobFitAnalysis(payload);
      setJobFit(jobFitRes);
      // Fetch mapping sub-resource
      const mappingRes = await fetchJobFitMapping(jobFitRes.id);
      setMapping(mappingRes);
      // Fetch feedback sub-resource (triggers lazy feedback generation)
      const feedbackRes = await fetchJobFitFeedback(jobFitRes.id);
      setFeedback(feedbackRes);
      onCreated && onCreated(jobFitRes);
    } catch (err: any) {
      setError(err.message || 'Creation failed.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <div>
        <label className="font-medium">Resume</label>
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[220px]">
            {(() => {
              const resume = resumes.find(r => r.resume_id === resumeId);
              if (resume) return resume.name || resume.resume_id;
              if (resumeId) return resumeId;
              return <span className="text-gray-400">None selected</span>;
            })()}
          </span>
          <button
            type="button"
            className="ml-1 text-blue-600 hover:text-blue-800 p-1 rounded"
            title="Change Resume"
            onClick={onEditResume}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <label className="font-medium">Job</label>
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[220px]">
            {(() => {
              const job = jobs.find(j => j.job_id === jobId);
              if (job) return job.name || (job.title ? `${job.title}${job.company ? ' @ ' + job.company : ''}` : '') || job.job_id;
              if (jobId) return jobId;
              return <span className="text-gray-400">None selected</span>;
            })()}
          </span>
          <button
            type="button"
            className="ml-1 text-blue-600 hover:text-blue-800 p-1 rounded"
            title="Change Job"
            onClick={onEditJob}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <label className="font-medium">Analysis Name</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="text"
          placeholder="Analysis Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      {/* Targeting Criteria Selector */}
      {jobId && (
        <div>
          <label className="font-medium mb-1 block">Targeting Criteria</label>
          <JobFitCategorySelector
            jobId={jobId}
            onSubmit={setSelectedCategories}
            onLoaded={setSelectedCategories}
          />
        </div>
      )}
      <Button type="submit" disabled={creating || loading || !resumeId || !jobId || !selectedCategories}>
        {creating ? 'Creating...' : 'Create Job-Fit Analysis'}
      </Button>
      {jobFit && (
        <div className="text-sm text-green-700">
          Analysis created: {jobFit.name || jobFit.id || 'created'}
        </div>
      )}
      {mapping && (
        <div className="text-xs text-gray-600">
          Requirements mapped: {Array.isArray(mapping.requirements) ? mapping.requirements.length : 0}
        </div>
      )}
      {feedback && (
        <div className="text-xs text-gray-600">
          Feedback items: {Array.isArray(feedback) ? feedback.length : 0}
        </div>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
