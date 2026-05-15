import { BadRequestException, type PipeTransform } from '@nestjs/common';

import type { ZodSchema } from 'zod';

/**
 * Validates an incoming body against a Zod schema. Throws a generic
 * BadRequestException on failure; detailed issues stay server-side.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException('Invalid request payload');
    }
    return result.data;
  }
}
