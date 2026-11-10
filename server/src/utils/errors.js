export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  let message = err.message || 'An unexpected error occurred';
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5) {
    message = message.replaceAll(process.env.GEMINI_API_KEY, '[REDACTED]');
  }

  const response = {
    status,
    message,
    ...(err.details ? { details: err.details } : {}),
  };

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
