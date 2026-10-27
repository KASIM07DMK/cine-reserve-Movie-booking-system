import { ApiError } from '../utils/ApiError.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: Administrator privileges required for this action.'));
  }
  next();
};
