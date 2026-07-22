import { io } from 'socket.io-client';

let socket = null;

// In dev, '/' resolves to the Vite dev server which proxies /socket.io to
// localhost:4000. In production the backend lives on a different host
// (Render), so VITE_API_URL must point at its origin.
const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
