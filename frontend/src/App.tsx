
import { useState } from 'react';
import { ResumeUpload, ResumeUploadResponse } from '@/components/resume/ResumeUpload';
import { ResumeListInline } from '@/components/resume/ResumeListInline';
import { JobUpload, JobUploadResponse } from '@/components/job/JobUpload';
import { JobListInline } from '@/components/job/JobListInline';
import { JobFitCreate, JobFitCreateResponse } from '@/components/jobfit/JobFitCreate';
import { JobFitResult } from '@/components/jobfit/JobFitResult';
import { JobFitList } from '@/components/jobfit/JobFitList';

const steps = [
  { key: 'resume', label: 'Resume' },
  { key: 'job', label: 'Job Description' },
  { key: 'jobfit', label: 'Analyze Fit' },
  { key: 'results', label: 'Results' },
  { key: 'manage', label: 'Manage' },
];

export default function App() {
  const [step, setStep] = useState<'resume' | 'job' | 'jobfit' | 'results' | 'manage'>('resume');
  const [resumeId, setResumeId] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [jobFitId, setJobFitId] = useState<string>('');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Stepper */}
        <ol className="flex items-center w-full mb-8 space-x-2 text-sm font-medium text-gray-500">
          {steps.map((s, idx) => (
            <li
              key={s.key}
              className={`flex-1 flex flex-col items-center ${step === s.key ? 'text-primary font-bold' : ''}`}
            >
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === s.key ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300 bg-white'}`}
                onClick={() => setStep(s.key as any)}
                aria-current={step === s.key ? 'step' : undefined}
              >
                {idx + 1}
              </button>
              <span className="mt-2">{s.label}</span>
            </li>
          ))}
        </ol>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[320px] flex flex-col gap-6">
          {step === 'resume' && (
            <>
              <h2 className="text-xl font-semibold mb-2">Upload or Select Resume</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 w-full">
                  <ResumeUpload onUploaded={(data: ResumeUploadResponse) => {
                    setResumeId(data.resume_id || '');
                    setStep('job');
                  }} />
                  {resumeId && (
                    <div className="text-sm text-green-600">Resume uploaded! <span className="font-mono">{resumeId}</span></div>
                  )}
                </div>
                <div className="md:w-1/2 w-full">
                  <h3 className="font-semibold mb-2">Your Resumes</h3>
                  <ResumeListInline
                    onSelect={id => {
                      setResumeId(id);
                      setStep('job');
                    }}
                    selectedId={resumeId}
                  />
                </div>
              </div>
            </>
          )}
          {step === 'job' && (
            <>
              <h2 className="text-xl font-semibold mb-2">Upload or Select Job Description</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 w-full">
                  <JobUpload onUploaded={(data: JobUploadResponse) => {
                    setJobId(data.job_id || '');
                    setStep('jobfit');
                  }} />
                  {jobId && (
                    <div className="text-sm text-green-600">Job uploaded! <span className="font-mono">{jobId}</span></div>
                  )}
                </div>
                <div className="md:w-1/2 w-full">
                  <h3 className="font-semibold mb-2">Your Jobs</h3>
                  <JobListInline
                    onSelect={id => {
                      setJobId(id);
                      setStep('jobfit');
                    }}
                    selectedId={jobId}
                  />
                </div>
              </div>
            </>
          )}
                    {step === 'manage' && (
                      <>
                        <h2 className="text-xl font-semibold mb-2">Manage Resumes & Jobs</h2>
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="md:w-1/2 w-full">
                            <h3 className="font-semibold mb-2">Resumes</h3>
                            <ResumeListInline />
                          </div>
                          <div className="md:w-1/2 w-full">
                            <h3 className="font-semibold mb-2">Jobs</h3>
                            <JobListInline />
                          </div>
                        </div>
                      </>
                    )}
          {step === 'jobfit' && (
            <>
              <h2 className="text-xl font-semibold mb-2">Analyze Job Fit</h2>
              <JobFitCreate
                resumeId={resumeId}
                jobId={jobId}
                onEditResume={() => setStep('resume')}
                onEditJob={() => setStep('job')}
                onCreated={(data: JobFitCreateResponse) => {
                  setJobFitId(data.id || '');
                  setStep('results');
                }}
              />
              {jobFitId && (
                <div className="text-sm text-green-600">Analysis started! <span className="font-mono">{jobFitId}</span></div>
              )}
            </>
          )}
          {step === 'results' && (
            <>
              <h2 className="text-xl font-semibold mb-2">Results</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 w-full">
                  <JobFitList onSelect={id => setJobFitId(id)} selectedId={jobFitId} />
                </div>
                <div className="md:w-2/3 w-full">
                  <JobFitResult jobFitId={jobFitId} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setStep('resume')}
                >
                  Start Over
                </button>
                <button
                  className="px-4 py-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => setStep('job')}
                >
                  New Job
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
