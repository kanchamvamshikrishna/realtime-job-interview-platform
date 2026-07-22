import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const groupCounts = (results) =>
  results.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Platform-wide analytics (admin only)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Admin analytics
 */
export const adminDashboard = asyncHandler(async (req, res) => {
  const [usersByRole, jobsByStatus, applicationsByStatus, totalUsers, totalJobs, totalApplications] =
    await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

  const signupsOverTime = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totals: { totalUsers, totalJobs, totalApplications },
      usersByRole: groupCounts(usersByRole),
      jobsByStatus: groupCounts(jobsByStatus),
      applicationsByStatus: groupCounts(applicationsByStatus),
      signupsOverTime,
    })
  );
});

/**
 * @swagger
 * /api/dashboard/candidate:
 *   get:
 *     summary: Application tracking analytics for the authenticated candidate
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Candidate analytics
 */
export const candidateDashboard = asyncHandler(async (req, res) => {
  const applicationsByStatus = await Application.aggregate([
    { $match: { candidate: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentApplications = await Application.find({ candidate: req.user._id })
    .populate('job', 'title company')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(
    new ApiResponse(200, {
      applicationsByStatus: groupCounts(applicationsByStatus),
      recentApplications,
    })
  );
});

/**
 * @swagger
 * /api/dashboard/recruiter:
 *   get:
 *     summary: Job and applicant analytics for the authenticated recruiter
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Recruiter analytics
 */
export const recruiterDashboard = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).select('_id title status');
  const jobIds = jobs.map((j) => j._id);

  const applicationsByStatus = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const applicantsPerJob = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalJobs: jobs.length,
      openJobs: jobs.filter((j) => j.status === 'open').length,
      applicationsByStatus: groupCounts(applicationsByStatus),
      applicantsPerJob,
    })
  );
});
