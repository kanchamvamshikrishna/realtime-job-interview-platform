import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { users }));
});

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user account (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deactivated
 */
export const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = Boolean(isActive);
  await user.save();

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'User updated'));
});
