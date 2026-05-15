import { z, type ZodSchema } from 'zod';

/**
 * Parse process.env with a Zod schema and throw a clear error on failure.
 * Apps define their own schema and call this once at boot.
 */
export const loadEnv = <T>(
  schema: ZodSchema<T>,
  source: Record<string, string | undefined> = process.env,
): T => {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
};

export const NodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');
