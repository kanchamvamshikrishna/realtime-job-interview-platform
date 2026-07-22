import { Message, buildConversationId } from '../models/Message.js';
import { userRoom } from './index.js';

export const registerChatHandlers = (io, socket) => {
  socket.on('join_conversation', ({ otherUserId }) => {
    if (!otherUserId) return;
    const conversationId = buildConversationId(socket.user._id, otherUserId);
    socket.join(conversationId);
  });

  socket.on('send_message', async ({ recipientId, content, applicationId }, callback) => {
    try {
      if (!recipientId || !content?.trim()) {
        return callback?.({ success: false, message: 'recipientId and content are required' });
      }

      if (recipientId === socket.user._id.toString()) {
        return callback?.({ success: false, message: 'You cannot message yourself' });
      }

      const conversationId = buildConversationId(socket.user._id, recipientId);

      const message = await Message.create({
        conversationId,
        sender: socket.user._id,
        recipient: recipientId,
        application: applicationId || undefined,
        content: content.trim(),
      });

      const payload = {
        _id: message._id,
        conversationId,
        sender: socket.user._id,
        recipient: recipientId,
        content: message.content,
        application: message.application,
        createdAt: message.createdAt,
      };

      // Deliver once per user room (deduped via Set — defensive in case a
      // future caller ever allows sender === recipient again). Both
      // participants may also be in the shared conversationId room (from
      // join_conversation), so broadcasting there too would double-deliver
      // to whichever one is joined.
      const targetRooms = new Set([userRoom(recipientId), userRoom(socket.user._id)]);
      targetRooms.forEach((room) => io.to(room).emit('receive_message', payload));

      callback?.({ success: true, message: payload });
    } catch (err) {
      callback?.({ success: false, message: err.message });
    }
  });

  socket.on('typing', ({ recipientId }) => {
    if (!recipientId) return;
    const conversationId = buildConversationId(socket.user._id, recipientId);
    socket.to(conversationId).emit('typing', { userId: socket.user._id.toString() });
  });

  socket.on('stop_typing', ({ recipientId }) => {
    if (!recipientId) return;
    const conversationId = buildConversationId(socket.user._id, recipientId);
    socket.to(conversationId).emit('stop_typing', { userId: socket.user._id.toString() });
  });
};
