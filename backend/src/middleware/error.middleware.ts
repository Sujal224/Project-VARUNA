/**
 * src/middleware/error.middleware.ts
 *
 * Centralized error handling and 404 middleware for Express.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/errors/ApiError';
import { ApiResponse } from '../common/responses/apiResponse';
import { logger } from '../config/logger';

/**
 * Catches requests to unmatched routes and forwards a 404 ApiError.
 */
export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} not found`));
}

/**
 * Global error-handling middleware. Must be mounted as the last middleware in app.ts.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const requestId = req.id || (req.headers['x-request-id'] as string) || 'unknown';

  if (err instanceof ApiError) {
    const isServerError = err.statusCode >= 500;
    const logData = {
      requestId,
      statusCode: err.statusCode,
      code: err.code,
      path: req.originalUrl,
      method: req.method,
      details: err.details,
    };

    if (isServerError) {
      logger.error(logData, err.message);
    } else {
      logger.warn(logData, err.message);
    }

    res
      .status(err.statusCode)
      .json(ApiResponse.error(err.code, err.message, requestId, err.details));
    return;
  }

  // Unhandled internal errors
  logger.error(
    {
      err,
      requestId,
      path: req.originalUrl,
      method: req.method,
    },
    'Unhandled server error encountered in request pipeline',
  );

  res
    .status(500)
    .json(
      ApiResponse.error(
        'INTERNAL_SERVER_ERROR',
        'An unexpected internal server error occurred.',
        requestId,
      ),
    );
}
