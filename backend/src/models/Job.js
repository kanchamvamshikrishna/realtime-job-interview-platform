import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    skills: [{ type: String, trim: true }],
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });
jobSchema.index({ location: 1, type: 1, status: 1 });

export const Job = mongoose.model('Job', jobSchema);
