import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetRecruiterDashboardQuery } from '../features/dashboard/dashboardApi';
import { Spinner } from '../components/Spinner';

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const toChartData = (obj = {}) => Object.entries(obj).map(([name, count]) => ({ name, count }));

export const RecruiterDashboard = () => {
  const { data, isLoading } = useGetRecruiterDashboardQuery();

  if (isLoading) return <Spinner />;

  const d = data?.data;
  if (!d) return null;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Recruiter Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Jobs Posted" value={d.totalJobs} />
        <StatCard label="Open Jobs" value={d.openJobs} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 font-semibold">Applicants by status</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={toChartData(d.applicationsByStatus)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
