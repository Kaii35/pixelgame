import { z, type ZodTypeAny } from 'zod';

/**
 * Parse process.env with a Zod schema and throw a clear error on failure.
 * Apps define their own schema and call this once at boot.
 *
 * Uses z.output<S> so schemas declaring `.default(...)` resolve to a fully
 * populated type (no `| undefined` leaks for fields with defaults).
 */
export const loadEnv = <S extends ZodTypeAny>(
  schema: S,
  source: Record<string, string | undefined> = process.env,
): z.output<S> => {
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
