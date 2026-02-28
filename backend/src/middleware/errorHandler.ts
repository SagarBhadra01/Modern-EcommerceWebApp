import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  // Log error in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error ${statusCode}]`, message, err.stack);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Conflict',
      message: 'A record with this value already exists.',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found.',
    });
    return;
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.name ?? 'Error',
    message,
  });
};

/**
 * Wraps async route handlers to automatically catch errors
 * and pass them to the error handler middleware.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
