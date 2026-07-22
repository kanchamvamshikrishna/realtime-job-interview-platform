import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(form).unwrap();
      dispatch(setCredentials(res.data));
      navigate('/jobs');
    } catch {
      // error surfaced below via RTK Query error state
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
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
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">I am a…</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="candidate">Candidate — looking for a job</option>
            <option value="recruiter">Recruiter — hiring for a company</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error.data?.errors?.join(', ') || error.data?.message || 'Registration failed'}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Log in
        </Link>
      </p>
    </div>
  );
};
