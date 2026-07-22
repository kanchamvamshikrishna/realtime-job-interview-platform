import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteJobMutation, useGetJobQuery } from '../features/jobs/jobsApi';
import { useApplyToJobMutation } from '../features/applications/applicationsApi';
import { useAuth } from '../features/auth/useAuth';
import { Spinner } from '../components/Spinner';

export const JobDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetJobQuery(id);
  const { isAuthenticated, user, role } = useAuth();
  const [deleteJob] = useDeleteJobMutation();
  const [applyToJob, { isLoading: isApplying, isSuccess, error }] = useApplyToJobMutation();
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();

  if (isLoading) return <Spinner />;

  const job = data?.data?.job;
  if (!job) return <p>Job not found.</p>;

  const isOwner = role === 'recruiter' && job.postedBy?._id === user?._id;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) return;
    try {
      await applyToJob({ jobId: job._id, coverLetter, resume }).unwrap();
    } catch {
      // error surfaced below
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job posting?')) return;
    await deleteJob(job._id);
    navigate('/my-jobs');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {job.company} · {job.location} · {job.type}
            </p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                to={`/jobs/${job._id}/edit`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-900"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {(job.salaryMin || job.salaryMax) && (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            Salary: {job.salaryMin ?? '—'} – {job.salaryMax ?? '—'}
          </p>
        )}

        {job.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{job.description}</p>
      </div>

      {role === 'candidate' && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-lg font-semibold">Apply to this job</h2>

          {isSuccess ? (
            <p className="text-green-600">Application submitted successfully!</p>
          ) : (
            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Resume (PDF or Word)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cover letter (optional)</label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error.data?.message || 'Failed to apply'}</p>
              )}
              <button
                type="submit"
                disabled={isApplying}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isApplying ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Log in
          </Link>{' '}
          as a candidate to apply for this job.
        </p>
      )}
    </div>
  );
};
