import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { Job } from '../models/Job.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List/search/filter job posts (public)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Paginated list of jobs
 */
export const listJobs = asyncHandler(async (req, res) => {
  const { search, location, type, page = 1, limit = 10 } = req.query;

  const filter = { status: 'open' };
  if (location) filter.location = new RegExp(location, 'i');
  if (type) filter.type = type;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      jobs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    })
  );
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job by id
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job detail
 */
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
  if (!job) throw new ApiError(404, 'Job not found');
  res.status(200).json(new ApiResponse(200, { job }));
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a job post (recruiter only)
 *     tags: [Jobs]
 *     responses:
 *       201:
 *         description: Job created
 */
export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json(new ApiResponse(201, { job }, 'Job created'));
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job post (owning recruiter only)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job updated
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own job posts');
  }

  Object.assign(job, req.body);
  await job.save();

  res.status(200).json(new ApiResponse(200, { job }, 'Job updated'));
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job post (owning recruiter only)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job deleted
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own job posts');
  }

  await job.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Job deleted'));
});

/**
 * @swagger
 * /api/jobs/recruiter/mine:
 *   get:
 *     summary: List job posts created by the authenticated recruiter
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Recruiter's jobs
 */
export const listMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { jobs }));
});

const csvRowSchema = z.object({
  title: z.string().min(2, 'title is required (min 2 chars)'),
  description: z.string().min(10, 'description is required (min 10 chars)'),
  company: z.string().min(1, 'company is required'),
  location: z.string().min(1, 'location is required'),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional().or(z.literal('')),
  skills: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
});

/**
 * @swagger
 * /api/jobs/bulk-import:
 *   post:
 *     summary: Bulk-create job posts from a CSV file (recruiter only)
 *     tags: [Jobs]
 *     responses:
 *       201:
 *         description: Import summary with created/failed row counts
 */
export const bulkImportJobs = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'CSV file is required');

  let rows;
  try {
    rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    throw new ApiError(400, `Failed to parse CSV: ${err.message}`);
  }

  if (rows.length === 0) throw new ApiError(400, 'CSV file has no data rows');
  if (rows.length > 200) throw new ApiError(400, 'CSV cannot contain more than 200 rows at a time');

  const toCreate = [];
  const failed = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for header row, +1 for 1-indexing
    const result = csvRowSchema.safeParse(row);

    if (!result.success) {
      failed.push({
        row: rowNumber,
        error: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
      });
      return;
    }

    const data = result.data;
    const salaryMin = data.salaryMin ? Number(data.salaryMin) : undefined;
    const salaryMax = data.salaryMax ? Number(data.salaryMax) : undefined;

    if ((data.salaryMin && Number.isNaN(salaryMin)) || (data.salaryMax && Number.isNaN(salaryMax))) {
      failed.push({ row: rowNumber, error: 'salaryMin/salaryMax must be numbers' });
      return;
    }

    toCreate.push({
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      type: data.type || 'full-time',
      skills: data.skills
        ? data.skills.split(';').map((s) => s.trim()).filter(Boolean)
        : [],
      salaryMin,
      salaryMax,
      postedBy: req.user._id,
    });
  });

  const inserted = toCreate.length > 0 ? await Job.insertMany(toCreate) : [];

  res.status(201).json(
    new ApiResponse(
      201,
      { createdCount: inserted.length, failedCount: failed.length, failed },
      `Imported ${inserted.length} job(s)${failed.length ? `, ${failed.length} row(s) failed` : ''}`
    )
  );
});
