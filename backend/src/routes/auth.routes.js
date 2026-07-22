import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', verifyJWT, logout);
router.get('/me', verifyJWT, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;
