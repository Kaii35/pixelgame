import { iso } from '@pixelgame/game-core';

import type { RoomLayoutSnapshot } from '../../state/room.store';
import type Phaser from 'phaser';


const COLOR_TILE_A = 0x1f2937;
const COLOR_TILE_B = 0x232c40;
const COLOR_TILE_STROKE = 0x141a26;

/**
 * Draw a flat isometric floor of `layout.width` × `layout.height` tiles
 * into a Graphics object owned by `parent`. Two alternating colors give
 * a subtle checkerboard. The caller is responsible for destruction.
 */
export const drawFloor = (
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  layout: RoomLayoutSnapshot,
): Phaser.GameObjects.Graphics => {
  const graphics = scene.add.graphics();
  const halfW = iso.TILE_WIDTH / 2;
  const halfH = iso.TILE_HEIGHT / 2;

  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      const { sx, sy } = iso.tileToScreen({ x, y });
      const fill = (x + y) % 2 === 0 ? COLOR_TILE_A : COLOR_TILE_B;

      graphics.lineStyle(1, COLOR_TILE_STROKE, 1);
      graphics.fillStyle(fill, 1);
      graphics.beginPath();
      graphics.moveTo(sx, sy);
      graphics.lineTo(sx + halfW, sy + halfH);
      graphics.lineTo(sx, sy + iso.TILE_HEIGHT);
      graphics.lineTo(sx - halfW, sy + halfH);
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();
    }
  }

  // Floor sits behind all avatars.
  graphics.setDepth(-1);
  parent.add(graphics);
  return graphics;
};
