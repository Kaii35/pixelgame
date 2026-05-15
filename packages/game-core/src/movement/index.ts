import type { RoomLayout, TilePosition } from '@pixelgame/shared-types';

import { isWalkable } from '../tile';

export interface MoveValidation {
  valid: boolean;
  reason?: 'out_of_bounds' | 'blocked' | 'too_far' | 'same_tile';
}

export const MAX_MOVE_RADIUS = 16;

/** Validate a movement intent before pathfinding runs. */
export const validateMoveIntent = (
  layout: RoomLayout,
  from: TilePosition,
  to: TilePosition,
): MoveValidation => {
  if (from.x === to.x && from.y === to.y) return { valid: false, reason: 'same_tile' };
  if (!isWalkable(layout, to.x, to.y)) {
    return { valid: false, reason: 'blocked' };
  }
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  if (dx > MAX_MOVE_RADIUS || dy > MAX_MOVE_RADIUS) {
    return { valid: false, reason: 'too_far' };
  }
  return { valid: true };
};
