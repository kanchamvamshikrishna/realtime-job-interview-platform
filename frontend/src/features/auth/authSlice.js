import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
