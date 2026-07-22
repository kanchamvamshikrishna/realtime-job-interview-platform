import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/generateTokens.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { registerChatHandlers } from './chatHandlers.js';
import { registerPresenceHandlers } from './presenceHandlers.js';

let io;

export const userRoom = (userId) => `user:${userId}`;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('User not found or inactive'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.user._id));
    registerPresenceHandlers(io, socket);
    registerChatHandlers(io, socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO has not been initialized yet');
  return io;
};
