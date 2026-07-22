import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return next(new ApiError(400, 'Validation failed', errors));
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = result.data.query;
  if (result.data.params) req.params = result.data.params;

  next();
};
