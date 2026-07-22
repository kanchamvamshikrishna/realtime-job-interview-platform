import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import { getIO, userRoom } from '../sockets/index.js';

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply to a job with a resume upload (candidate only)
 *     tags: [Applications]
 *     responses:
 *       201:
 *         description: Application submitted
 */
export const createApplication = asyncHandler(async (req, res) => {
  const { jobId, coverLetter } = req.body;

  if (!req.file) throw new ApiError(400, 'Resume file is required');

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.status !== 'open') throw new ApiError(400, 'This job is no longer accepting applications');

  const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
  if (existing) throw new ApiError(409, 'You have already applied to this job');

  const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
    public_id: `resume_${req.user._id}_${Date.now()}`,
  });

  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resumeUrl: uploadResult.secure_url,
    resumePublicId: uploadResult.public_id,
    coverLetter: coverLetter || '',
  });

  const notification = await Notification.create({
    user: job.postedBy,
    type: 'new_application',
    message: `New application received for "${job.title}"`,
    relatedApplication: application._id,
  });

  try {
    getIO().to(userRoom(job.postedBy)).emit('new_application', {
      application,
      notification,
    });
  } catch {
    // socket layer may be unavailable (e.g. in tests) — REST response is unaffected
  }

  res.status(201).json(new ApiResponse(201, { application }, 'Application submitted'));
});

/**
 * @swagger
 * /api/applications/me:
 *   get:
 *     summary: List applications submitted by the authenticated candidate
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: Candidate's applications
 */
export const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate({ path: 'job', populate: { path: 'postedBy', select: 'name email' } })
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { applications }));
});

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: List applicants for a given job (owning recruiter only)
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: Applicants for the job
 */
export const listApplicantsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only view applicants for your own jobs');
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate('candidate', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { applications }));
});

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update an application's status (owning recruiter only) — emits a real-time update
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: Application status updated
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, interviewDate } = req.body;

  const application = await Application.findById(req.params.id).populate('job');
  if (!application) throw new ApiError(404, 'Application not found');

  const job = application.job;
  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update applications for your own jobs');
  }

  application.status = status;
  if (interviewDate) application.interviewDate = interviewDate;
  await application.save();

  const notification = await Notification.create({
    user: application.candidate,
    type: 'application_status',
    message: `Your application for "${job.title}" is now "${status.replace('_', ' ')}"`,
    relatedApplication: application._id,
  });

  try {
    getIO().to(userRoom(application.candidate)).emit('application_status_updated', {
      applicationId: application._id,
      status: application.status,
      interviewDate: application.interviewDate,
      notification,
    });
  } catch {
    // socket layer may be unavailable (e.g. in tests) — REST response is unaffected
  }

  res.status(200).json(new ApiResponse(200, { application }, 'Application status updated'));
});
