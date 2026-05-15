import { movement, pathfinding } from '@pixelgame/game-core';
import { TileVec, type WorldRoomState } from '@pixelgame/networking';

import type { RoomLayout } from '@pixelgame/shared-types';

/** Time between authoritative tile steps (ms). 200ms = 5 tiles/second. */
export const STEP_MS = 200;
/** Minimum spacing between accepted move intents per session. */
export const INTENT_COOLDOWN_MS = 50;

interface MoveIntentLike {
  to: { x: number; y: number };
  clientTime: number;
}

/**
 * Authoritative movement system.
 * Validates intents, runs A* on the room layout, and advances each player
 * along their path one tile per STEP_MS during the simulation tick.
 */
export class MovementSystem {
  private readonly stepAccumulators = new Map<string, number>();
  private readonly lastIntentAt = new Map<string, number>();

  constructor(
    private readonly state: WorldRoomState,
    private readonly layout: RoomLayout,
  ) {}

  handleIntent(sessionId: string, intent: MoveIntentLike): void {
    const now = Date.now();
    const last = this.lastIntentAt.get(sessionId) ?? 0;
    if (now - last < INTENT_COOLDOWN_MS) return;

    const player = this.state.players.get(sessionId);
    if (!player) return;

    const from = { x: player.position.x, y: player.position.y };
    const to = { x: intent.to.x, y: intent.to.y };

    const validation = movement.validateMoveIntent(this.layout, from, to);
    if (!validation.valid) return;

    const path = pathfinding.findPath(this.layout, from, to);
    if (path.length === 0) return;

    player.path.clear();
    for (const step of path) {
      player.path.push(new TileVec().assign({ x: step.x, y: step.y }));
    }

    this.stepAccumulators.set(sessionId, 0);
    player.lastUpdate = now;
    this.lastIntentAt.set(sessionId, now);
  }

  update(deltaMs: number): void {
    this.state.players.forEach((player, sessionId) => {
      if (player.path.length === 0) {
        this.stepAccumulators.delete(sessionId);
        return;
      }

      let accumulator = (this.stepAccumulators.get(sessionId) ?? 0) + deltaMs;

      while (accumulator >= STEP_MS && player.path.length > 0) {
        const next = player.path.shift();
        if (!next) break;
        player.position.assign({ x: next.x, y: next.y });
        accumulator -= STEP_MS;
        player.lastUpdate = Date.now();
      }

      this.stepAccumulators.set(sessionId, accumulator);
    });
  }

  onLeave(sessionId: string): void {
    this.stepAccumulators.delete(sessionId);
    this.lastIntentAt.delete(sessionId);
  }
}
