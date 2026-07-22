import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['application_status', 'new_application', 'new_message', 'system'],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
