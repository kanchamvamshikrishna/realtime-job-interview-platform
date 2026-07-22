import { User } from '../models/User.js';

export const registerPresenceHandlers = (io, socket) => {
  const markOnline = async (isOnline) => {
    socket.user.isOnline = isOnline;
    socket.user.lastSeen = new Date();
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline,
      lastSeen: socket.user.lastSeen,
    });
    io.emit(isOnline ? 'user_online' : 'user_offline', {
      userId: socket.user._id.toString(),
      lastSeen: socket.user.lastSeen,
    });
  };

  markOnline(true);

  socket.on('disconnect', () => {
    markOnline(false);
  });
};
