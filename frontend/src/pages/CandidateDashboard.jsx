import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetCandidateDashboardQuery } from '../features/dashboard/dashboardApi';
import { Spinner } from '../components/Spinner';

const toChartData = (obj = {}) => Object.entries(obj).map(([name, count]) => ({ name, count }));

export const CandidateDashboard = () => {
  const { data, isLoading } = useGetCandidateDashboardQuery();

  if (isLoading) return <Spinner />;

  const d = data?.data;
  if (!d) return null;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Candidate Dashboard</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 font-semibold">Your applications by status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={toChartData(d.applicationsByStatus)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 font-semibold">Recent applications</h2>
        {d.recentApplications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No applications yet.</p>
        ) : (
          <ul className="space-y-2">
            {d.recentApplications.map((app) => (
              <li key={app._id} className="flex justify-between text-sm">
                <Link to={`/jobs/${app.job._id}`} className="hover:underline">
                  {app.job.title} · {app.job.company}
                </Link>
                <span className="text-gray-500 dark:text-gray-400">{app.status.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
