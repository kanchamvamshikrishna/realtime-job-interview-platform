import { z } from 'zod';

const jobBase = {
  title: z.string().min(2),
  description: z.string().min(10),
  company: z.string().min(1),
  location: z.string().min(1),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  skills: z.array(z.string()).optional(),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
};

export const createJobSchema = z.object({
  body: z.object(jobBase),
});

export const updateJobSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object(jobBase).partial().extend({
    status: z.enum(['open', 'closed']).optional(),
  }),
});

const emptyToUndefined = (schema) => z.preprocess((val) => (val === '' ? undefined : val), schema);

export const listJobsSchema = z.object({
  query: z.object({
    search: emptyToUndefined(z.string().optional()),
    location: emptyToUndefined(z.string().optional()),
    type: emptyToUndefined(z.enum(['full-time', 'part-time', 'contract', 'internship']).optional()),
    page: emptyToUndefined(z.coerce.number().int().positive().optional()),
    limit: emptyToUndefined(z.coerce.number().int().positive().max(100).optional()),
  }),
});
