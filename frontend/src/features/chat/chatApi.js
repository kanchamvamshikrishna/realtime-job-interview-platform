import { baseApi } from '../../app/baseApi';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listConversations: builder.query({
      query: () => '/chat',
      providesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    getConversation: builder.query({
      query: (otherUserId) => `/chat/${otherUserId}`,
      providesTags: (result, error, otherUserId) => [{ type: 'Conversation', id: otherUserId }],
    }),
  }),
});

export const { useListConversationsQuery, useGetConversationQuery } = chatApi;
