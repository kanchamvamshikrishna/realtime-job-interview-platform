import { useState } from 'react';
import { useListJobsQuery } from '../features/jobs/jobsApi';
import { JobCard } from '../components/JobCard';
import { Pagination } from '../components/Pagination';
import { Spinner } from '../components/Spinner';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];

export const JobListPage = () => {
  const [filters, setFilters] = useState({ search: '', location: '', type: '', page: 1 });
  const { data, isLoading, isFetching } = useListJobsQuery(filters);

  const jobs = data?.data?.jobs || [];
  const pagination = data?.data?.pagination;

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Browse Jobs</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          placeholder="Search title, skills, company…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All types</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No jobs match your filters.</p>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      )}
    </div>
  );
};
