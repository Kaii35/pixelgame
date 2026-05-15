import { loadEnv, NodeEnvSchema } from '@pixelgame/shared-config';
import { z } from 'zod';

const GameServerEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  GAME_SERVER_PORT: z.coerce.number().int().positive().default(2567),
  GAME_SERVER_HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_PUBLIC_KEY_PATH: z.string(),
  JWT_ISSUER: z.string().default('pixelgame'),
  JWT_AUDIENCE: z.string().default('pixelgame-client'),
});

export type GameServerEnv = z.infer<typeof GameServerEnvSchema>;
export const env: GameServerEnv = loadEnv(GameServerEnvSchema);
