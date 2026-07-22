import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useListMyJobsQuery, useBulkImportJobsMutation } from '../features/jobs/jobsApi';
import { Spinner } from '../components/Spinner';

const CSV_TEMPLATE = `title,company,location,type,skills,salaryMin,salaryMax,description
Senior Backend Engineer,Acme Corp,Remote,full-time,Node.js;Express;MongoDB,70000,100000,"Own our core API services and mentor junior engineers."
Product Designer,Acme Corp,Bengaluru,part-time,Figma;Design Systems,30000,50000,"Design clean and accessible interfaces across our product."
`;

const downloadTemplate = () => {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jobs-template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const BulkImportPanel = () => {
  const [bulkImport, { isLoading }] = useBulkImportJobsMutation();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResult(null);
    setError(null);

    try {
      const res = await bulkImport(file).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err.data?.message || 'Failed to import CSV');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Bulk post jobs from CSV</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Columns: title, company, location, type, skills (semicolon-separated), salaryMin, salaryMax, description
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadTemplate}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
          >
            Download template
          </button>
          <label className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            {isLoading ? 'Uploading…' : 'Upload CSV'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
          <p className="font-medium text-green-600">{result.createdCount} job(s) created</p>
          {result.failedCount > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-600">{result.failedCount} row(s) failed:</p>
              <ul className="mt-1 list-inside list-disc text-gray-600 dark:text-gray-400">
                {result.failed.map((f) => (
                  <li key={f.row}>
                    Row {f.row}: {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const MyJobsPage = () => {
  const { data, isLoading } = useListMyJobsQuery();
  const jobs = data?.data?.jobs || [];

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Job Posts</h1>
        <Link
          to="/my-jobs/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Post a job
        </Link>
      </div>

      <BulkImportPanel />

      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You haven't posted any jobs yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {job.location} · {job.type} ·{' '}
                  <span className={job.status === 'open' ? 'text-green-600' : 'text-gray-400'}>
                    {job.status}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <Link to={`/jobs/${job._id}/applicants`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                  Applicants
                </Link>
                <Link to={`/jobs/${job._id}`} className="text-gray-600 hover:underline dark:text-gray-400">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
