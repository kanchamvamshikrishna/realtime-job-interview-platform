import crypto from 'crypto';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateTokens.js';
import { sendMockEmail } from '../utils/sendMockEmail.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.crossOriginCookies || env.nodeEnv === 'production',
  sameSite: env.crossOriginCookies ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const issueTokens = (user) => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (candidate or recruiter)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: User registered
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email is already registered');

  const user = new User({ name, email, password, role: role || 'candidate' });
  const verificationToken = user.generateVerificationToken();
  await user.save();

  const mockEmail = sendMockEmail({
    to: user.email,
    subject: 'Verify your email',
    body: `Click to verify: ${env.clientUrl}/verify-email/${verificationToken}`,
  });

  const { accessToken, refreshToken } = issueTokens(user);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json(
    new ApiResponse(
      201,
      { user: user.toSafeObject(), accessToken, mockEmail },
      'Registration successful'
    )
  );
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account has been deactivated');

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  const { accessToken, refreshToken } = issueTokens(user);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, { user: user.toSafeObject(), accessToken }, 'Login successful')
  );
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh the access token using the refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User no longer available');

  const accessToken = generateAccessToken(user);
  res.status(200).json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out'));
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeObject() }));
});

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify email using a mock verification token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Email verified
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ verificationToken: hashed }).select('+verificationToken');
  if (!user) throw new ApiError(400, 'Invalid or expired verification token');

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset (mock email)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Reset instructions generated
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'If that email exists, reset instructions were sent'));
  }

  const resetToken = user.generateResetToken();
  await user.save();

  const mockEmail = sendMockEmail({
    to: user.email,
    subject: 'Reset your password',
    body: `Reset link: ${env.clientUrl}/reset-password/${resetToken} (valid 1 hour)`,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { mockEmail }, 'If that email exists, reset instructions were sent'));
});

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using the mock reset token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful'));
});
