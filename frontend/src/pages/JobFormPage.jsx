import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateJobMutation, useGetJobQuery, useUpdateJobMutation } from '../features/jobs/jobsApi';
import { Spinner } from '../components/Spinner';

const emptyForm = {
  title: '',
  description: '',
  company: '',
  location: '',
  type: 'full-time',
  skills: '',
  salaryMin: '',
  salaryMax: '',
};

export const JobFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data, isLoading } = useGetJobQuery(id, { skip: !isEdit });
  const [createJob, { isLoading: creating, error: createError }] = useCreateJobMutation();
  const [updateJob, { isLoading: updating, error: updateError }] = useUpdateJobMutation();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isEdit && data?.data?.job) {
      const job = data.data.job;
      setForm({
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        type: job.type,
        skills: (job.skills || []).join(', '),
        salaryMin: job.salaryMin ?? '',
        salaryMax: job.salaryMax ?? '',
      });
    }
  }, [isEdit, data]);

  if (isEdit && isLoading) return <Spinner />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    };

    try {
      if (isEdit) {
        await updateJob({ id, ...payload }).unwrap();
        navigate(`/jobs/${id}`);
      } else {
        const res = await createJob(payload).unwrap();
        navigate(`/jobs/${res.data.job._id}`);
      }
    } catch {
      // error surfaced below
    }
  };

  const isSubmitting = creating || updating;
  const error = createError || updateError;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? 'Edit job' : 'Post a new job'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Company</label>
          <input
            required
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Salary min</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Salary max</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Skills (comma separated)</label>
          <input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="React, Node.js, MongoDB"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error.data?.errors?.join(', ') || error.data?.message || 'Failed to save job'}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Post job'}
        </button>
      </form>
    </div>
  );
};
