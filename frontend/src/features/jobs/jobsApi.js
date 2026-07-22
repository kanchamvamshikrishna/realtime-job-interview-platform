import { baseApi } from '../../app/baseApi';

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listJobs: builder.query({
      query: (params) => {
        const cleaned = Object.fromEntries(
          Object.entries(params || {}).filter(([, value]) => value !== '' && value != null)
        );
        return { url: '/jobs', params: cleaned };
      },
      providesTags: (result) =>
        result?.data?.jobs
          ? [
              ...result.data.jobs.map((job) => ({ type: 'Job', id: job._id })),
              { type: 'Job', id: 'LIST' },
            ]
          : [{ type: 'Job', id: 'LIST' }],
    }),
    getJob: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),
    listMyJobs: builder.query({
      query: () => '/jobs/recruiter/mine',
      providesTags: [{ type: 'MyJobs', id: 'LIST' }],
    }),
    createJob: builder.mutation({
      query: (body) => ({ url: '/jobs', method: 'POST', body }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }, { type: 'MyJobs', id: 'LIST' }],
    }),
    updateJob: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/jobs/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Job', id },
        { type: 'Job', id: 'LIST' },
        { type: 'MyJobs', id: 'LIST' },
      ],
    }),
    deleteJob: builder.mutation({
      query: (id) => ({ url: `/jobs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }, { type: 'MyJobs', id: 'LIST' }],
    }),
    bulkImportJobs: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/jobs/bulk-import', method: 'POST', body: formData };
      },
      invalidatesTags: [{ type: 'Job', id: 'LIST' }, { type: 'MyJobs', id: 'LIST' }],
    }),
  }),
});

export const {
  useListJobsQuery,
  useGetJobQuery,
  useListMyJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useBulkImportJobsMutation,
} = jobsApi;
