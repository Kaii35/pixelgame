import { z } from 'zod';

export const RoomIdSchema = z.string().uuid();
export type RoomId = z.infer<typeof RoomIdSchema>;

export interface TilePosition {
  x: number;
  y: number;
}

export interface RoomLayout {
  width: number;
  height: number;
  /** 0 = void, 1 = walkable floor, 2 = blocked. */
  tiles: number[][];
  spawn: TilePosition;
}

export interface RoomSummary {
  id: RoomId;
  name: string;
  ownerId: string | null;
  capacity: number;
  occupants: number;
  createdAt: string;
}

export interface RoomDetail extends RoomSummary {
  layout: RoomLayout;
}
