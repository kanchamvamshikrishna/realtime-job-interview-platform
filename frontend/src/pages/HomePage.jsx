import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="text-4xl font-bold">Real-Time Job Interview Platform</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Find your next role, chat live with recruiters, and track your interview status in real time.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/jobs" className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">
          Browse Jobs
        </Link>
        {!isAuthenticated && (
          <Link
            to="/register"
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
};
