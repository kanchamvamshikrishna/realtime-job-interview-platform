import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form).unwrap();
      dispatch(setCredentials(res.data));
      navigate(location.state?.from?.pathname || '/jobs');
    } catch {
      // error surfaced below via RTK Query error state
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error.data?.message || 'Login failed'}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Forgot password?
        </Link>
        <Link to="/register" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Create an account
        </Link>
      </div>
    </div>
  );
};
