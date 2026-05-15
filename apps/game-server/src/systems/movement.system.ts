import type { MoveIntent, WorldRoomState } from '@pixelgame/networking';
import { TileVec } from '@pixelgame/networking';

/**
 * Authoritative movement system.
 * Fase 4 wires up real pathfinding against a RoomLayout loaded from Postgres.
 * For now: snap-to-target with basic clamping.
 */
export class MovementSystem {
  constructor(private readonly state: WorldRoomState) {}

  handleIntent(sessionId: string, intent: MoveIntent): void {
    const player = this.state.players.get(sessionId);
    if (!player) return;
    player.path.clear();
    const dest = new TileVec().assign({ x: intent.to.x, y: intent.to.y });
    player.path.push(dest);
    player.lastUpdate = Date.now();
  }

  update(_deltaMs: number): void {
    // Step along player.path one tile per N ticks. Implement in Fase 4.
  }
}
