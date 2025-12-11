import { useRef, useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';

export interface ResumeUploadResponse {
  resume_id?: string;
  message?: string;
}

export interface ResumeUploadProps {
  onUploaded?: (data: ResumeUploadResponse) => void;
}


interface ResumeListItem {
  resume_id: string;
  [key: string]: any;
}

export function ResumeUpload({ onUploaded }: ResumeUploadProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoadingResumes(true);
      try {
        const res = await fetch('/api/v1/resume');
        const data = await res.json();
        setResumes(data.resumes || []);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSelectedResumeId("");
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setName(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      setName("");
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!selectedFile && !selectedResumeId) {
      setError('Please select a file or an existing resume.');
      return;
    }
    if (selectedFile && !name.trim()) {
      setError('Please provide a name for the resume.');
      return;
    }
    if (selectedResumeId) {
      // Use existing resume
      onUploaded && onUploaded({ resume_id: selectedResumeId });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile!);
    formData.append('name', name);
    try {
      const res = await fetch('/api/v1/resume/file', {
        method: 'POST',
        body: formData,
      });
      const data: ResumeUploadResponse = await res.json();
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
    <form onSubmit={handleUpload} className="space-y-4 flex flex-col items-center w-full">
      {/* Existing resume selection removed; handled by ResumeListInline in parent */}
      <div className="w-full flex flex-col gap-2">
        <label className="font-medium">Or Upload New Resume</label>
        <input
          id="resume-upload-input"
          type="file"
          ref={fileInput}
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          className="mb-2"
          onClick={() => fileInput.current?.click()}
        >
          {selectedFile ? selectedFile.name : 'Choose Resume File'}
        </Button>
        {selectedFile && (
          <input
            className="w-full border rounded px-3 py-2 mt-2"
            type="text"
            placeholder="Resume Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        )}
      </div>
      <Button type="submit" disabled={uploading || (!selectedFile && !selectedResumeId)}>
        {uploading ? 'Uploading...' : selectedResumeId ? 'Use Selected Resume' : 'Upload Resume'}
      </Button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
