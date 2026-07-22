import { Link } from 'react-router-dom';
import { useListMyApplicationsQuery } from '../features/applications/applicationsApi';
import { Spinner } from '../components/Spinner';

const STATUS_STYLES = {
  applied: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  shortlisted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  interview_scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  hired: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export const MyApplicationsPage = () => {
  const { data, isLoading } = useListMyApplicationsQuery();
  const applications = data?.data?.applications || [];

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          You haven't applied to any jobs yet.{' '}
          <Link to="/jobs" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Browse jobs
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app._id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <Link to={`/jobs/${app.job._id}`} className="font-semibold hover:underline">
                  {app.job.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">{app.job.company}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[app.status]}`}>
                  {app.status.replace('_', ' ')}
                </span>
                {app.job.postedBy && (
                  <Link
                    to={`/chat/${app.job.postedBy._id}`}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Message recruiter
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
