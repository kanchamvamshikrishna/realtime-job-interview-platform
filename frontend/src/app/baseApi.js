import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAccessToken, logout } from '../features/auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

let refreshPromise = null;

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !args?.url?.includes('/auth/')) {
    refreshPromise =
      refreshPromise ||
      rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions).finally(() => {
        refreshPromise = null;
      });

    const refreshResult = await refreshPromise;

    if (refreshResult.data) {
      api.dispatch(setAccessToken(refreshResult.data.data.accessToken));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Job', 'MyJobs', 'Application', 'Applicants', 'Conversation', 'Dashboard', 'User'],
  endpoints: () => ({}),
});
