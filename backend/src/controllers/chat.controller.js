import { Message, buildConversationId } from '../models/Message.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

/**
 * @swagger
 * /api/chat/{otherUserId}:
 *   get:
 *     summary: Get message history with another user
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Message history
 */
export const getConversation = asyncHandler(async (req, res) => {
  const conversationId = buildConversationId(req.user._id, req.params.otherUserId);
  const [messages, otherUser] = await Promise.all([
    Message.find({ conversationId }).sort({ createdAt: 1 }),
    User.findById(req.params.otherUserId).select('name email role avatarUrl isOnline lastSeen'),
  ]);
  res.status(200).json(new ApiResponse(200, { messages, otherUser }));
});

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: List distinct conversations for the authenticated user
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: List of conversation partners with last message
 */
export const listConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  const otherUserIds = conversations.map((c) =>
    c.lastMessage.sender.toString() === userId.toString()
      ? c.lastMessage.recipient
      : c.lastMessage.sender
  );
  const otherUsers = await User.find({ _id: { $in: otherUserIds } }).select(
    'name email role avatarUrl isOnline lastSeen'
  );
  const otherUserById = Object.fromEntries(otherUsers.map((u) => [u._id.toString(), u]));

  const enriched = conversations.map((c) => {
    const otherId =
      c.lastMessage.sender.toString() === userId.toString()
        ? c.lastMessage.recipient.toString()
        : c.lastMessage.sender.toString();
    return { ...c, otherUser: otherUserById[otherId] || null };
  });

  res.status(200).json(new ApiResponse(200, { conversations: enriched }));
});
