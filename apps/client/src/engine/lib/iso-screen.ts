import { iso } from '@pixelgame/game-core';

/**
 * Inverse projection: screen-space (relative to world container origin)
 * back to tile coordinates.
 *
 * TODO: upstream this to @pixelgame/game-core/iso once stabilized; keep here
 * for now to unblock client picking without touching shared packages.
 */
export const screenToTile = (sx: number, sy: number): { x: number; y: number } => {
  const halfW = iso.TILE_WIDTH / 2;
  const halfH = iso.TILE_HEIGHT / 2;
  return {
    x: Math.floor((sx / halfW + sy / halfH) / 2),
    y: Math.floor((sy / halfH - sx / halfW) / 2),
  };
};
