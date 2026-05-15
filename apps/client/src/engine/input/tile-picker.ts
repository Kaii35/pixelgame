import Phaser from 'phaser';

import { useRoomStore, type RoomLayoutSnapshot } from '../../state/room.store';
import { screenToTile } from '../lib/iso-screen';

/**
 * Installs a pointerdown handler that converts the click into a tile
 * coordinate (taking the world container's origin into account) and
 * dispatches a move intent via the room store.
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
    const send = useRoomStore.getState().sendMoveIntent;
    if (send) send(tile);
  };

  scene.input.on(Phaser.Input.Events.POINTER_DOWN, handler);
  return () => {
    scene.input.off(Phaser.Input.Events.POINTER_DOWN, handler);
  };
};
