import type { RoomLayout } from '@pixelgame/shared-types';

export const TILE_VOID = 0;
export const TILE_FLOOR = 1;
export const TILE_BLOCKED = 2;

export const inBounds = (layout: RoomLayout, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < layout.width && y < layout.height;

export const tileAt = (layout: RoomLayout, x: number, y: number): number => {
  if (!inBounds(layout, x, y)) return TILE_VOID;
  return layout.tiles[y]?.[x] ?? TILE_VOID;
};

export const isWalkable = (layout: RoomLayout, x: number, y: number): boolean =>
  tileAt(layout, x, y) === TILE_FLOOR;
