import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../features/auth/authApi';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading, isSuccess, data }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword({ email });
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Forgot password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending…' : 'Send reset instructions'}
        </button>
      </form>

      {isSuccess && (
        <div className="mt-4 rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">
          <p className="mb-1 font-medium">
            Mock email sent (no real email is sent in this assessment build):
          </p>
          <pre className="whitespace-pre-wrap">{data?.data?.mockEmail?.body || 'Check server console for the reset link.'}</pre>
        </div>
      )}

      <p className="mt-4 text-sm">
        <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Back to login
        </Link>
      </p>
    </div>
  );
};
