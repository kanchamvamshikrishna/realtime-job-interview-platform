import { Link } from 'react-router-dom';

export const JobCard = ({ job }) => (
  <Link
    to={`/jobs/${job._id}`}
    className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
  >
    <div className="flex items-start justify-between gap-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
      <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
        {job.type}
      </span>
    </div>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
      {job.company} · {job.location}
    </p>
    {job.skills?.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {skill}
          </span>
        ))}
      </div>
    )}
  </Link>
);
