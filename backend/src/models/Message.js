import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    content: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const buildConversationId = (userIdA, userIdB) =>
  [userIdA.toString(), userIdB.toString()].sort().join(':');

export const Message = mongoose.model('Message', messageSchema);
