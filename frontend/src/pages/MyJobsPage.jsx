import { Link } from 'react-router-dom';
import { useListMyJobsQuery } from '../features/jobs/jobsApi';
import { Spinner } from '../components/Spinner';

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
