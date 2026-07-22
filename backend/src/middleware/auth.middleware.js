import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/generateTokens.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) throw new ApiError(401, 'Authentication token missing');

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user) throw new ApiError(401, 'User no longer exists');
  if (!user.isActive) throw new ApiError(403, 'Account has been deactivated');

  req.user = user;
  next();
});

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw new ApiError(401, 'Not authenticated');
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
