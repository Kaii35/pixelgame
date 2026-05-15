import { randomUUID } from 'node:crypto';

import { catalog, tile as tileUtils } from '@pixelgame/game-core';
import { FurniturePiece, TileVec, type WorldRoomState } from '@pixelgame/networking';

import type { VerifiedToken } from '../auth/jwt-verifier';
import type { RoomLayout } from '@pixelgame/shared-types';


const MAX_FURNITURE = 64;
const PLACE_COOLDOWN_MS = 80;

interface PlaceInput {
  kind: string;
  tile: { x: number; y: number };
}

/**
 * Authoritative decoration system. Validates every place/remove against the
 * catalog and the room layout. Per-session cooldown prevents flood.
 */
export class DecorationSystem {
  private readonly lastActionAt = new Map<string, number>();

  constructor(
    private readonly state: WorldRoomState,
    private readonly layout: RoomLayout,
  ) {}

  place(sessionId: string, author: VerifiedToken, input: PlaceInput): void {
    const now = Date.now();
    if (now - (this.lastActionAt.get(sessionId) ?? 0) < PLACE_COOLDOWN_MS) return;

    if (this.state.furniture.size >= MAX_FURNITURE) return;
    if (!catalog.isKnownKind(input.kind)) return;
    if (!tileUtils.isWalkable(this.layout, input.tile.x, input.tile.y)) return;
    if (this.tileOccupied(input.tile.x, input.tile.y)) return;

    const piece = new FurniturePiece();
    piece.id = randomUUID();
    piece.kind = input.kind;
    piece.tile = new TileVec().assign({ x: input.tile.x, y: input.tile.y });
    piece.ownerId = author.userId;
    piece.placedAt = now;
    this.state.furniture.set(piece.id, piece);
    this.lastActionAt.set(sessionId, now);
  }

  remove(sessionId: string, _author: VerifiedToken, furnitureId: string): void {
    const now = Date.now();
    if (now - (this.lastActionAt.get(sessionId) ?? 0) < PLACE_COOLDOWN_MS) return;
    if (!this.state.furniture.has(furnitureId)) return;
    this.state.furniture.delete(furnitureId);
    this.lastActionAt.set(sessionId, now);
  }

  onLeave(sessionId: string): void {
    this.lastActionAt.delete(sessionId);
  }

  private tileOccupied(x: number, y: number): boolean {
    let occupied = false;
    this.state.furniture.forEach((piece) => {
      if (piece.tile.x === x && piece.tile.y === y) occupied = true;
    });
    return occupied;
  }
}
