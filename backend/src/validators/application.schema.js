import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, 'jobId is required'),
    coverLetter: z.string().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired']),
    interviewDate: z.coerce.date().optional(),
  }),
});
