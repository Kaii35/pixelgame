import { Logger } from '@nestjs/common';
import { room as roomCore } from '@pixelgame/game-core';

import type { PrismaService } from '../database/prisma.service';
import type { Prisma } from '@prisma/client';


const logger = new Logger('Seed');

/**
 * Ensure at least one default room exists. Idempotent: skips if any room
 * is already present.
 */
export const runSeed = async (prisma: PrismaService): Promise<void> => {
  const count = await prisma.room.count();
  if (count > 0) {
    logger.log('[seed] skipped (rooms exist)');
    return;
  }

  const layout = roomCore.buildEmptyLayout(12, 12);
  const room = await prisma.room.create({
    data: {
      name: 'Default Plaza',
      capacity: 20,
      ownerId: null,
      layout: layout as unknown as Prisma.InputJsonValue,
    },
  });
  logger.log(`[seed] created default room ${room.id}`);
};
