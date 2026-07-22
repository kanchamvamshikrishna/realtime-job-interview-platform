import { baseApi } from '../../app/baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query({
      query: (params) => ({ url: '/users', params }),
      providesTags: [{ type: 'User', id: 'LIST' }],
    }),
    setUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({ url: `/users/${id}/status`, method: 'PATCH', body: { isActive } }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const { useListUsersQuery, useSetUserStatusMutation } = usersApi;
