/**
 * src/server.ts
 *
 * Backend server entry point.
 * Initializes the HTTP server and registers graceful termination signal handlers.
 */

import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

async function bootstrap(): Promise<void> {
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV,
        corsOrigin: env.CORS_ORIGIN,
      },
      'VARUNA Marine Intelligence Backend initialized',
    );
    logger.info(`Health check available at: http://localhost:${env.PORT}/api/v1/health`);
  });

  // ── Graceful Shutdown Management ──────────────────────────────────────────
  let isShuttingDown = false;

  const gracefulShutdown = (signal: string): void => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Termination signal received. Initiating graceful shutdown...');

    server.close(() => {
      logger.info('HTTP server closed. All in-flight requests completed.');
      process.exit(0);
    });

    // Fallback timer: Force exit if requests do not finish within 10 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s. Forcing process exit.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error({ reason }, 'Unhandled Promise Rejection detected');
    gracefulShutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error({ error }, 'Uncaught Exception detected — emergency shutdown');
    process.exit(1);
  });
}

bootstrap().catch((error: unknown) => {
  logger.error({ error }, 'Bootstrap failed to start server');
  process.exit(1);
});
