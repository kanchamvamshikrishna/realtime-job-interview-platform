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
