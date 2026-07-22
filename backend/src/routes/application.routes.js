import { Router } from 'express';
import {
  createApplication,
  listMyApplications,
  listApplicantsForJob,
  updateApplicationStatus,
} from '../controllers/application.controller.js';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from '../validators/application.schema.js';

const router = Router();

router.use(verifyJWT);

router.post(
  '/',
  requireRole('candidate'),
  uploadResume,
  validate(createApplicationSchema),
  createApplication
);
router.get('/me', requireRole('candidate'), listMyApplications);
router.get('/job/:jobId', requireRole('recruiter', 'admin'), listApplicantsForJob);
router.patch(
  '/:id/status',
  requireRole('recruiter', 'admin'),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;
