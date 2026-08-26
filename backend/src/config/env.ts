/**
 * src/config/env.ts
 *
 * Validates and exports strongly-typed environment variables using Zod.
 * Fails fast at application bootstrap if any required configuration is missing or invalid.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: z.string().default('*'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('');
  console.error('====================================================');
  console.error('  VARUNA Backend Configuration Error');
  console.error('====================================================');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  console.error('Please check your .env file against .env.example');
  console.error('');
  process.exit(1);
}

export const env = parseResult.data;
export type Env = typeof env;
