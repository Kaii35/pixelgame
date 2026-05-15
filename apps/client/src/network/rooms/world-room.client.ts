import { ROOM_NAMES, WorldRoomState } from '@pixelgame/networking';
import type { Room } from 'colyseus.js';

import { colyseusClient } from '../client';

export interface JoinWorldOptions {
  accessToken: string;
  roomId?: string;
}

export const joinWorldRoom = async (options: JoinWorldOptions): Promise<Room<WorldRoomState>> => {
  return colyseusClient.joinOrCreate<WorldRoomState>(ROOM_NAMES.WORLD, options);
};
