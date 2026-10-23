import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';

export interface JobUploadResponse {
  job_id?: string;
  message?: string;
}

export interface JobUploadProps {
  onUploaded?: (data: JobUploadResponse) => void;
}


type Tab = 'url' | 'text' | 'file';

export function JobUpload({ onUploaded }: JobUploadProps) {
  const [tab, setTab] = useState<Tab>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setName(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      setName('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if ((tab === 'file' && selectedFile && !name.trim()) || ((tab === 'text' || tab === 'url') && !name.trim())) {
      setError('Please provide a name for the job.');
      return;
    }
    setUploading(true);
    try {
      let res: Response | undefined;
      let data: JobUploadResponse;
      if (tab === 'url') {
        if (!jobUrl) {
          setError('Please enter a job URL.');
          setUploading(false);
          return;
        }
        res = await fetch('/api/v1/job/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_url: jobUrl, name }),
        });
      } else if (tab === 'text') {
        if (!jobText) {
          setError('Please enter job text.');
          setUploading(false);
          return;
        }
        res = await fetch('/api/v1/job/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_text: jobText, name }),
        });
      } else if (tab === 'file') {
        if (!selectedFile) {
          setError('Please select a file.');
          setUploading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', name);
        res = await fetch('/api/v1/job/file', {
          method: 'POST',
          body: formData,
        });
      }
      if (!res) throw new Error('Unsupported upload type.');
      data = await res.json() as JobUploadResponse;
      if (res.ok) {
        onUploaded && onUploaded(data);
      } else {
        setError(data.message || 'Upload failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <Button type="button" variant={tab === 'url' ? 'default' : 'outline'} onClick={() => setTab('url')}>URL</Button>
        <Button type="button" variant={tab === 'text' ? 'default' : 'outline'} onClick={() => setTab('text')}>Plain Text</Button>
        <Button type="button" variant={tab === 'file' ? 'default' : 'outline'} onClick={() => setTab('file')}>File</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'url' && (
          <>
            <input
              className="w-full border rounded p-2"
              type="url"
              placeholder="Paste job description URL here"
              value={jobUrl}
              onChange={e => setJobUrl(e.target.value)}
            />
            <input
              className="w-full border rounded p-2 mt-2"
              type="text"
              placeholder="Job Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </>
        )}
        {tab === 'text' && (
          <>
            <textarea
              className="w-full border rounded p-2"
              rows={6}
              placeholder="Paste job description text here"
              value={jobText}
              onChange={e => setJobText(e.target.value)}
            />
            <input
              className="w-full border rounded p-2 mt-2"
              type="text"
              placeholder="Job Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </>
        )}
        {tab === 'file' && (
          <div className="flex flex-col items-center w-full">
            <input
              id="job-upload-input"
              type="file"
              ref={fileInput}
              accept=".pdf,.doc,.docx,.md"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="mb-2"
              onClick={() => fileInput.current?.click()}
            >
              {selectedFile ? selectedFile.name : 'Choose Job File'}
            </Button>
            {selectedFile && (
              <input
                className="w-full border rounded p-2 mt-2"
                type="text"
                placeholder="Job Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            )}
          </div>
        )}
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Job'}
        </Button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </div>
  );
}
