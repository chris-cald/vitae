import React from 'react';

interface JsonThumbnailProps {
  data: Record<string, any>;
  fields?: string[]; // Optional: which fields to show
  className?: string;
}

// Visually rich, document-like thumbnail preview for resume, job, or job-fit
export const JsonThumbnail: React.FC<JsonThumbnailProps> = ({ data, fields, className }) => {
  if (!data) return null;

  // Resume preview
  if (data.resume_id || data.basics) {
    return (
      <div className={`w-32 h-40 border shadow bg-white rounded overflow-hidden flex flex-col p-2 ${className || ''}`.trim()} style={{ fontFamily: 'serif', fontSize: '0.8rem' }}>
        <div className="font-bold text-base text-center mb-1 truncate">{data.name || data.basics?.name || 'Resume'}</div>
        <div className="text-xs text-gray-700 mb-1 text-center truncate">{data.basics?.label}</div>
        <div className="flex-1 overflow-hidden">
          <div className="text-xs text-gray-600 whitespace-pre-line break-words line-clamp-6">
            {data.basics?.summary || data.summary || '...'}
          </div>
        </div>
        {/* No ID overlay */}
      </div>
    );
  }

  // Job preview
  if (data.job_id || data.title) {
    return (
      <div className={`w-32 h-40 border shadow bg-white rounded overflow-hidden flex flex-col p-2 ${className || ''}`.trim()} style={{ fontFamily: 'serif', fontSize: '0.8rem' }}>
        <div className="font-bold text-base text-center mb-1 truncate">{data.title || 'Job'}</div>
        <div className="text-xs text-gray-700 mb-1 text-center truncate">{data.company}</div>
        <div className="flex-1 overflow-hidden">
          <div className="text-xs text-gray-600 whitespace-pre-line break-words line-clamp-6">
            {data.description || data.summary || '...'}
          </div>
        </div>
        {/* No ID overlay */}
      </div>
    );
  }

  // Job-fit preview
  if (data.id && (data.resume_id || data.job_id)) {
    return (
      <div className={`w-32 h-40 border shadow bg-white rounded overflow-hidden flex flex-col p-2 ${className || ''}`.trim()} style={{ fontFamily: 'serif', fontSize: '0.8rem' }}>
        <div className="font-bold text-base text-center mb-1 truncate">Job Fit</div>
        <div className="text-xs text-gray-700 mb-1 text-center truncate">Resume: {data.resume_id}</div>
        <div className="text-xs text-gray-700 mb-1 text-center truncate">Job: {data.job_id}</div>
        <div className="flex-1 overflow-hidden">
          <div className="text-xs text-gray-600 whitespace-pre-line break-words line-clamp-6">
            {data.result_summary || data.summary || '...'}
          </div>
        </div>
        {/* No ID overlay */}
      </div>
    );
  }

  // Fallback: generic JSON preview
  const keys = fields || Object.keys(data).slice(0, 3);
  return (
    <div className={`w-32 h-40 border shadow bg-white rounded overflow-hidden flex flex-col p-2 ${className || ''}`.trim()} style={{ fontFamily: 'serif', fontSize: '0.8rem' }}>
      <div className="font-bold text-base text-center mb-1 truncate">Item</div>
      <div className="flex-1 overflow-hidden">
        {keys.map(key => (
          <div key={key} className="truncate text-xs text-gray-700">
            <span className="font-semibold mr-1">{key}:</span>
            <span>{typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
