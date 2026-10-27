import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If not an instance of ApiError, convert
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `A record with this ${field} already exists.`);
  }

  const response = {
    success: false,
    message: error.message,
    error: {
      code: error.errors?.length ? 'VALIDATION_ERROR' : (error.statusCode === 404 ? 'NOT_FOUND' : 'API_ERROR'),
      details: error.errors?.length ? error.errors : undefined
    },
    ...(config.env === 'development' ? { stack: error.stack } : {})
  };

  return res.status(error.statusCode || 500).json(response);
};
