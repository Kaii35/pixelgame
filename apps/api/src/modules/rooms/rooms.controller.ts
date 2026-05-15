import { Controller, Get } from '@nestjs/common';

import { RoomsService } from './rooms.service';

import type { RoomSummary } from '@pixelgame/shared-types';
import type { Room } from '@prisma/client';


const toRoomSummary = (room: Room): RoomSummary => ({
  id: room.id,
  name: room.name,
  ownerId: room.ownerId,
  capacity: room.capacity,
  occupants: 0,
  createdAt: room.createdAt.toISOString(),
});

@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Get()
  async list(): Promise<RoomSummary[]> {
    const rooms = await this.rooms.listPublic();
    return rooms.map(toRoomSummary);
  }
}
