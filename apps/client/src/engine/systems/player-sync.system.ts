
import { AvatarSprite } from '../entities/avatar.sprite';

import type { RemotePlayer } from '../../state/room.store';
import type Phaser from 'phaser';

/**
 * Maintains the sessionId → AvatarSprite map for the room scene.
 * The scene calls `sync` whenever the players slice changes and
 * `update(delta)` every frame for interpolation.
 */
export class PlayerSyncSystem {
  private readonly scene: Phaser.Scene;
  private readonly world: Phaser.GameObjects.Container;
  private readonly sprites = new Map<string, AvatarSprite>();

  constructor(scene: Phaser.Scene, world: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.world = world;
  }

  sync(players: Record<string, RemotePlayer>): void {
    // Add or update.
    for (const sessionId of Object.keys(players)) {
      const snapshot = players[sessionId];
      if (!snapshot) continue;
      const existing = this.sprites.get(sessionId);
      if (existing) {
        existing.setSnapshot(snapshot);
      } else {
        const sprite = new AvatarSprite(this.scene, snapshot);
        this.world.add(sprite.container);
        sprite.setSnapshot(snapshot);
        this.sprites.set(sessionId, sprite);
      }
    }
    // Remove stale.
    for (const sessionId of Array.from(this.sprites.keys())) {
      if (!(sessionId in players)) {
        const sprite = this.sprites.get(sessionId);
        if (sprite) sprite.destroy();
        this.sprites.delete(sessionId);
      }
    }
  }

  getSpriteByUser(userId: string): AvatarSprite | undefined {
    for (const sprite of this.sprites.values()) {
      if (sprite.userId === userId) return sprite;
    }
    return undefined;
  }

  getSpriteBySession(sessionId: string): AvatarSprite | undefined {
    return this.sprites.get(sessionId);
  }

  update(deltaMs: number): void {
    for (const sprite of this.sprites.values()) {
      sprite.update(deltaMs);
    }
  }

  destroyAll(): void {
    for (const sprite of this.sprites.values()) {
      sprite.destroy();
    }
    this.sprites.clear();
  }
}
