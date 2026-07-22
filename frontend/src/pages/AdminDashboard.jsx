import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGetAdminDashboardQuery } from '../features/dashboard/dashboardApi';
import { Spinner } from '../components/Spinner';

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const toChartData = (obj = {}) => Object.entries(obj).map(([name, count]) => ({ name, count }));

export const AdminDashboard = () => {
  const { data, isLoading } = useGetAdminDashboardQuery();

  if (isLoading) return <Spinner />;

  const d = data?.data;
  if (!d) return null;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={d.totals.totalUsers} />
        <StatCard label="Total Jobs" value={d.totals.totalJobs} />
        <StatCard label="Total Applications" value={d.totals.totalApplications} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-semibold">Users by role</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={toChartData(d.usersByRole)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-semibold">Applications by status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={toChartData(d.applicationsByStatus)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-semibold">Signups over time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={d.signupsOverTime.map((s) => ({ date: s._id, count: s.count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
