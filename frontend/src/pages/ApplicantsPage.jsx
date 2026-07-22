import { Link, useParams } from 'react-router-dom';
import {
  useListApplicantsForJobQuery,
  useUpdateApplicationStatusMutation,
} from '../features/applications/applicationsApi';
import { Spinner } from '../components/Spinner';

const STATUS_OPTIONS = ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'];

export const ApplicantsPage = () => {
  const { jobId } = useParams();
  const { data, isLoading } = useListApplicantsForJobQuery(jobId);
  const [updateStatus] = useUpdateApplicationStatusMutation();

  const applications = data?.data?.applications || [];

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Applicants</h1>

      {applications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No applicants yet for this job.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app._id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <p className="font-semibold">{app.candidate.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{app.candidate.email}</p>
                {app.coverLetter && (
                  <p className="mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">{app.coverLetter}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View resume
                </a>
                <Link
                  to={`/chat/${app.candidate._id}`}
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Message
                </Link>
                <select
                  value={app.status}
                  onChange={(e) => updateStatus({ id: app._id, jobId, status: e.target.value })}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
