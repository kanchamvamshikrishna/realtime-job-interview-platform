import { baseApi } from '../../app/baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => '/dashboard/admin',
      providesTags: [{ type: 'Dashboard', id: 'ADMIN' }],
    }),
    getRecruiterDashboard: builder.query({
      query: () => '/dashboard/recruiter',
      providesTags: [{ type: 'Dashboard', id: 'RECRUITER' }],
    }),
    getCandidateDashboard: builder.query({
      query: () => '/dashboard/candidate',
      providesTags: [{ type: 'Dashboard', id: 'CANDIDATE' }],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetRecruiterDashboardQuery,
  useGetCandidateDashboardQuery,
} = dashboardApi;
