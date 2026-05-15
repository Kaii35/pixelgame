import type { RoomLayout } from '@pixelgame/shared-types';

/** Build a rectangular floor room of the given size. */
export const buildEmptyLayout = (width: number, height: number): RoomLayout => {
  const tiles: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) row.push(1);
    tiles.push(row);
  }
  return {
    width,
    height,
    tiles,
    spawn: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
  };
};
