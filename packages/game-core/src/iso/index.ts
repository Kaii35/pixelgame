/**
 * Isometric projection helpers.
 * Pure functions — usable in both client (rendering) and server (validation).
 *
 * Tile (x, y) → Screen (sx, sy):
 *   sx = (x - y) * (TILE_WIDTH / 2)
 *   sy = (x + y) * (TILE_HEIGHT / 2)
 *
 * Depth sort key: x + y (greater = drawn on top).
 */

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export interface ScreenPoint {
  sx: number;
  sy: number;
}

export interface TilePoint {
  x: number;
  y: number;
}

export const tileToScreen = (tile: TilePoint): ScreenPoint => ({
  sx: (tile.x - tile.y) * (TILE_WIDTH / 2),
  sy: (tile.x + tile.y) * (TILE_HEIGHT / 2),
});

export const screenToTile = (screen: ScreenPoint): TilePoint => {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  return {
    x: Math.floor((screen.sx / halfW + screen.sy / halfH) / 2),
    y: Math.floor((screen.sy / halfH - screen.sx / halfW) / 2),
  };
};

export const depthOf = (tile: TilePoint): number => tile.x + tile.y;
