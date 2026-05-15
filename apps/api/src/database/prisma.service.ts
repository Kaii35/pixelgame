import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Prisma lazy-connects on first query. We try once at boot for early-fail
    // signal but never crash the app — operational concerns (DB down,
    // migrations pending) shouldn't take the whole API offline at startup.
    try {
      await this.$connect();
      this.logger.log('connected to database');
    } catch (err) {
      this.logger.warn(
        `database unreachable at boot — queries will fail until it is up (${
          err instanceof Error ? err.message : String(err)
        })`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
