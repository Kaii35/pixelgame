import { loadEnv, NodeEnvSchema } from '@pixelgame/shared-config';
import { z } from 'zod';

const ApiEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  API_CORS_ORIGIN: z.string().default('http://localhost:5173'),

  /**
   * Data layer selector. `memory` runs everything in-process (no Docker)
   * and is the default for local dev. `postgres` uses Prisma + DATABASE_URL.
   */
  PIXEL_DB: z.enum(['memory', 'postgres']).default('memory'),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://placeholder:placeholder@localhost:5432/placeholder'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  JWT_PRIVATE_KEY_PATH: z.string(),
  JWT_PUBLIC_KEY_PATH: z.string(),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  JWT_ISSUER: z.string().default('pixelgame'),
  JWT_AUDIENCE: z.string().default('pixelgame-client'),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export const loadApiEnv = (): ApiEnv => loadEnv(ApiEnvSchema);
