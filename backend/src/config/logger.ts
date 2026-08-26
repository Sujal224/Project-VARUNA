/**
 * src/config/logger.ts
 *
 * Centralized structured logger using Pino.
 * Emits readable colored logs in development and fast machine-readable JSON in production.
 */

import pino from 'pino';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});
