/**
 * src/app.ts
 *
 * Express application factory.
 * Configures security, CORS, body parsing, request ID tracing, structured request logging,
 * versioned routing, and centralized error handling.
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { randomUUID } from 'crypto';

import { env } from './config/env';
import { logger } from './config/logger';
import { apiRouter } from './routes/index';
import { notFoundMiddleware, errorMiddleware } from './middleware/error.middleware';

// Augment Express Request interface with custom `id` property
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function createApp(): express.Application {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(helmet());

  // 2. Cross-Origin Resource Sharing
  const corsOrigin =
    env.CORS_ORIGIN === '*'
      ? '*'
      : env.CORS_ORIGIN.includes(',')
      ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : env.CORS_ORIGIN;

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  );

  // 3. Unique Request ID Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const clientHeader = req.headers['x-request-id'];
    const requestId =
      typeof clientHeader === 'string' && clientHeader.trim().length > 0
        ? clientHeader
        : randomUUID();

    req.id = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // 4. Body Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 5. Per-Request Structured Pino Logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const logLevel =
        res.statusCode >= 500
          ? 'error'
          : res.statusCode >= 400
          ? 'warn'
          : 'info';

      logger[logLevel](
        {
          requestId: req.id,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
        },
        'HTTP request completed',
      );
    });

    next();
  });

  // 6. Versioned API Routes (/api/v1)
  app.use('/api/v1', apiRouter);

  // 7. 404 Catch-All Middleware
  app.use(notFoundMiddleware);

  // 8. Centralized Error Handler (Must be registered last)
  app.use(errorMiddleware);

  return app;
}
