import { useListUsersQuery, useSetUserStatusMutation } from '../features/users/usersApi';
import { Spinner } from '../components/Spinner';

export const AdminUsersPage = () => {
  const { data, isLoading } = useListUsersQuery();
  const [setUserStatus] = useSetUserStatusMutation();
  const users = data?.data?.users || [];

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Manage Users</h1>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">{u.isActive ? 'Active' : 'Deactivated'}</td>
                <td className="px-4 py-2">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => setUserStatus({ id: u._id, isActive: !u.isActive })}
                      className="text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
