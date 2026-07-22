import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="mx-auto max-w-md py-16 text-center">
    <h1 className="text-3xl font-bold">404</h1>
    <p className="mt-2 text-gray-600 dark:text-gray-400">Page not found.</p>
    <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
      Back to home
    </Link>
  </div>
);
