import { ApiError } from '../utils/ApiError.js';

export const validateBody = (schemaValidator) => {
  return (req, res, next) => {
    const { isValid, errors } = schemaValidator(req.body);
    if (!isValid) {
      return next(new ApiError(400, errors[0] || 'Invalid request body', errors));
    }
    next();
  };
};
