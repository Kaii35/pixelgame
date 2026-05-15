import { Global, Logger, Module } from '@nestjs/common';

import { loadApiEnv } from '../config/env.validation';

import { InMemoryDatabaseClient } from './in-memory.client';
import { PrismaService } from './prisma.service';

/**
 * Selects the data layer at module init based on PIXEL_DB env:
 *   - `memory` (default in dev): InMemoryDatabaseClient — no Postgres needed.
 *   - `postgres`: real Prisma → connects to DATABASE_URL.
 *
 * Both are exposed under the `PrismaService` token; services only call the
 * subset of the API the shim implements, so the cast is safe at runtime.
 */
@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (): PrismaService => {
        const logger = new Logger('DatabaseModule');
        const env = loadApiEnv();
        if (env.PIXEL_DB === 'memory') {
          logger.warn('PIXEL_DB=memory — using in-memory database (data resets on restart)');
          return new InMemoryDatabaseClient() as unknown as PrismaService;
        }
        logger.log('PIXEL_DB=postgres — using Prisma against DATABASE_URL');
        return new PrismaService();
      },
    },
  ],
  exports: [PrismaService],
})
export class DatabaseModule {}
