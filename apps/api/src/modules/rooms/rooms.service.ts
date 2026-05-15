import { Injectable, Logger } from '@nestjs/common';


import type { PrismaService } from '../../database/prisma.service';
import type { RoomLayout } from '@pixelgame/shared-types';
import type { Prisma , Room } from '@prisma/client';


@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  listPublic(): Promise<Room[]> {
    return this.prisma.room.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createDefault(name: string, capacity: number, layout: RoomLayout): Promise<Room | null> {
    const existing = await this.prisma.room.count();
    if (existing > 0) {
      return null;
    }
    const room = await this.prisma.room.create({
      data: {
        name,
        capacity,
        ownerId: null,
        layout: layout as unknown as Prisma.InputJsonValue,
      },
    });
    this.logger.log(`created default room id=${room.id}`);
    return room;
  }
}
