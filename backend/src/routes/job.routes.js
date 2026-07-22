import { Router } from 'express';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  listMyJobs,
} from '../controllers/job.controller.js';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createJobSchema, updateJobSchema, listJobsSchema } from '../validators/job.schema.js';

const router = Router();

router.get('/', validate(listJobsSchema), listJobs);
router.get('/recruiter/mine', verifyJWT, requireRole('recruiter', 'admin'), listMyJobs);
router.get('/:id', getJob);
router.post('/', verifyJWT, requireRole('recruiter'), validate(createJobSchema), createJob);
router.put('/:id', verifyJWT, requireRole('recruiter', 'admin'), validate(updateJobSchema), updateJob);
router.delete('/:id', verifyJWT, requireRole('recruiter', 'admin'), deleteJob);

export default router;
