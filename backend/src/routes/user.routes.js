import { Router } from 'express';
import { listUsers, setUserActiveStatus } from '../controllers/user.controller.js';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, requireRole('admin'));
router.get('/', listUsers);
router.patch('/:id/status', setUserActiveStatus);

export default router;
