import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useLogoutMutation } from '../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice';
import { baseApi } from '../app/baseApi';
import { DarkModeToggle } from './DarkModeToggle';
import { disconnectSocket } from '../features/chat/socket';

const dashboardPathFor = (role) => {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'recruiter') return '/dashboard/recruiter';
  return '/dashboard/candidate';
};

export const Navbar = () => {
  const { isAuthenticated, user, role } = useAuth();
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // proceed with local logout regardless
    }
    disconnectSocket();
    dispatch(logoutAction());
    // Clear all cached query results so the next user logged into this tab
    // never sees a previous session's conversations/applications/jobs.
    dispatch(baseApi.util.resetApiState());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          KRIBUDWEBTECH Jobs
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/jobs" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Jobs
          </Link>

          {isAuthenticated && (
            <>
              <Link to={dashboardPathFor(role)} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Dashboard
              </Link>
              <Link to="/chat" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Messages
              </Link>
              {role === 'candidate' && (
                <Link to="/my-applications" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  My Applications
                </Link>
              )}
              {(role === 'recruiter' || role === 'admin') && (
                <Link to="/my-jobs" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  My Jobs
                </Link>
              )}
            </>
          )}

          <DarkModeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-gray-500 sm:inline dark:text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
