import React, { useEffect, useState } from 'react';
import { fetchProfileCategories, fetchJob, submitJobFitAnalysis } from '../../lib/api';

interface ProfileCategories {
  [key: string]: string[];
}

interface SelectedCategories {
  [key: string]: string | string[] | null;
}


interface JobFitCategorySelectorProps {
  jobId: string;
  onSubmit: (categories: SelectedCategories) => void;
  onLoaded?: (categories: SelectedCategories) => void;
}



interface CategoryConfig {
  [key: string]: {
    display_name: string;
    values: string[];
  };
}


export const JobFitCategorySelector: React.FC<JobFitCategorySelectorProps> = ({ jobId, onSubmit, onLoaded }) => {
  const [categories, setCategories] = useState<ProfileCategories>({});
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<SelectedCategories>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [catConfigRaw, job] = await Promise.all([
          fetchProfileCategories(),
          fetchJob(jobId),
        ]);
        // Type assertion for API response
        const catConfig = catConfigRaw as CategoryConfig;
        const categories: Record<string, string[]> = {};
        const displayNames: Record<string, string> = {};
        for (const [cat, def] of Object.entries(catConfig)) {
          categories[cat] = def.values;
          displayNames[cat] = def.display_name;
        }
        setCategories(categories);
        setDisplayNames(displayNames);
        // API returns { job: { ...fields..., profile_categories: {...} } }
        const initial = (job.job?.profile_categories) || {};
        setSelected(initial);
        if (onLoaded) onLoaded(initial);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId, onLoaded]);

  const handleChange = (category: string, value: string) => {
    setSelected((prev) => ({ ...prev, [category]: value }));
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([cat, options]) => (
        <div key={cat}>
          <label className="block font-semibold mb-1">{displayNames[cat] || cat.replace(/_/g, ' ')}</label>
          <select
            value={selected[cat] || ''}
            onChange={e => handleChange(cat, e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">No advice for this category</option>
            <option value="__default__">General best practices for this category</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => onSubmit(selected)}
      >
        Continue
      </button>
    </div>
  );
};
