import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    resumePublicId: { type: String },
    coverLetter: { type: String, default: '' },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'],
      default: 'applied',
    },
    interviewDate: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
