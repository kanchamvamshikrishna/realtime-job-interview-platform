import { baseApi } from '../../app/baseApi';

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyToJob: builder.mutation({
      query: ({ jobId, coverLetter, resume }) => {
        const formData = new FormData();
        formData.append('jobId', jobId);
        if (coverLetter) formData.append('coverLetter', coverLetter);
        formData.append('resume', resume);
        return { url: '/applications', method: 'POST', body: formData };
      },
      invalidatesTags: [{ type: 'Application', id: 'MINE' }],
    }),
    listMyApplications: builder.query({
      query: () => '/applications/me',
      providesTags: [{ type: 'Application', id: 'MINE' }],
    }),
    listApplicantsForJob: builder.query({
      query: (jobId) => `/applications/job/${jobId}`,
      providesTags: (result, error, jobId) => [{ type: 'Applicants', id: jobId }],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, jobId, ...body }) => ({
        url: `/applications/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { jobId }) => [{ type: 'Applicants', id: jobId }],
    }),
  }),
});

export const {
  useApplyToJobMutation,
  useListMyApplicationsQuery,
  useListApplicantsForJobQuery,
  useUpdateApplicationStatusMutation,
} = applicationsApi;
