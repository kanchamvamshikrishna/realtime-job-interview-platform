import { Router } from 'express';
import { adminDashboard, candidateDashboard, recruiterDashboard } from '../controllers/dashboard.controller.js';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);
router.get('/admin', requireRole('admin'), adminDashboard);
router.get('/candidate', requireRole('candidate'), candidateDashboard);
router.get('/recruiter', requireRole('recruiter', 'admin'), recruiterDashboard);

export default router;
