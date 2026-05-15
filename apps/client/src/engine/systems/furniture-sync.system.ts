
import { FurnitureSprite } from '../entities/furniture.sprite';

import type { FurnitureSnapshot } from '../../state/room.store';
import type Phaser from 'phaser';

/**
 * Maintains the id-keyed map of FurnitureSprite instances and keeps it in
 * sync with the room store. Same pattern as PlayerSyncSystem.
 */
export class FurnitureSyncSystem {
  private readonly sprites = new Map<string, FurnitureSprite>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly world: Phaser.GameObjects.Container,
  ) {}

  sync(furniture: Record<string, FurnitureSnapshot>): void {
    const incoming = new Set(Object.keys(furniture));
    for (const id of this.sprites.keys()) {
      if (!incoming.has(id)) {
        this.sprites.get(id)?.destroy();
        this.sprites.delete(id);
      }
    }
    for (const id of incoming) {
      const snap = furniture[id];
      if (!snap) continue;
      if (!this.sprites.has(id)) {
        const sprite = new FurnitureSprite(this.scene, snap);
        this.world.add(sprite.container);
        this.sprites.set(id, sprite);
      }
    }
  }

  destroyAll(): void {
    for (const s of this.sprites.values()) s.destroy();
    this.sprites.clear();
  }
}
