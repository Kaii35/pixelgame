import Phaser from 'phaser';

import { useRoomStore, type RoomLayoutSnapshot } from '../../state/room.store';
import { spawnClickRing } from '../effects/click-feedback';
import { screenToTile } from '../lib/iso-screen';

/**
 * Installs a pointerdown handler that converts the click into a tile
 * coordinate and dispatches the right action depending on store state:
 *
 *   - default mode → sendMoveIntent
 *   - editMode + selectedKind set + tile empty → sendPlaceFurniture
 *   - editMode + tile has furniture (regardless of selection) → remove it
 *
 * Returns an uninstall function that removes the listener.
 */
export const installTilePicker = (
  scene: Phaser.Scene,
  world: Phaser.GameObjects.Container,
  layout: RoomLayoutSnapshot,
): (() => void) => {
  const handler = (pointer: Phaser.Input.Pointer): void => {
    const localX = pointer.worldX - world.x;
    const localY = pointer.worldY - world.y;
    const tile = screenToTile(localX, localY);
    if (tile.x < 0 || tile.y < 0 || tile.x >= layout.width || tile.y >= layout.height) {
      return;
    }
    const s = useRoomStore.getState();

    if (s.editMode) {
      // Edit mode: remove takes priority over place when tile is occupied.
      const occupant = findFurnitureAtTile(s.furniture, tile);
      if (occupant) {
        s.sendRemoveFurniture?.(occupant);
        return;
      }
      if (s.selectedKind && s.sendPlaceFurniture) {
        s.sendPlaceFurniture(s.selectedKind, tile);
        spawnClickRing(scene, world, tile);
      }
      return;
    }

    // Default: walk.
    if (s.sendMoveIntent) {
      s.sendMoveIntent(tile);
      spawnClickRing(scene, world, tile);
    }
  };

  scene.input.on(Phaser.Input.Events.POINTER_DOWN, handler);
  return () => {
    scene.input.off(Phaser.Input.Events.POINTER_DOWN, handler);
  };
};

const findFurnitureAtTile = (
  furniture: ReturnType<typeof useRoomStore.getState>['furniture'],
  tile: { x: number; y: number },
): string | undefined => {
  for (const id in furniture) {
    const piece = furniture[id];
    if (piece && piece.tile.x === tile.x && piece.tile.y === tile.y) return id;
  }
  return undefined;
};
