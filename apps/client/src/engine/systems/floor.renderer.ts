import { iso } from '@pixelgame/game-core';


import { PALETTE, SUN } from '../theme';

import type { RoomLayoutSnapshot } from '../../state/room.store';
import type Phaser from 'phaser';

/**
 * Draw the isometric floor with a baked sun direction. Tiles closer to the
 * SUN.tile position pick up Plate; tiles farther fade toward Slate. Each
 * sun-facing tile also receives a faint cream highlight on its top edge.
 *
 * Returns the Graphics; caller owns destroy. The "platform shadow" ellipse
 * is parented to the same container and gets destroyed with it.
 */
export const drawFloor = (
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  layout: RoomLayoutSnapshot,
): Phaser.GameObjects.Graphics => {
  const halfW = iso.TILE_WIDTH / 2;
  const halfH = iso.TILE_HEIGHT / 2;

  // Platform shadow below the floor — lifts the slab off the void.
  const shadow = scene.add.graphics();
  shadow.setDepth(-110);
  const cx = ((layout.width - 1) * halfW - (layout.height - 1) * halfW) / 2;
  const cy = ((layout.width - 1) * halfH + (layout.height - 1) * halfH) / 2 + halfH;
  shadow.fillStyle(PALETTE.void, 0.6);
  shadow.fillEllipse(
    cx,
    cy + 4,
    (layout.width + layout.height) * halfW + 80,
    (layout.width + layout.height) * halfH + 32,
  );
  parent.add(shadow);

  const g = scene.add.graphics();
  g.setDepth(-100);
  parent.add(g);

  const farthest = SUN.falloffTiles;

  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      const { sx, sy } = iso.tileToScreen({ x, y });

      const dx = x - SUN.tile.x;
      const dy = y - SUN.tile.y;
      const dist = Math.hypot(dx, dy);
      const lit = Math.pow(Math.max(0, 1 - dist / farthest), 1.6);

      const fill = blend(PALETTE.slate, PALETTE.plate, lit);
      const stroke = blend(PALETTE.slate, PALETTE.plateGlow, Math.min(1, lit + 0.15));

      // Diamond — sx,sy is the TOP vertex.
      g.fillStyle(fill, 1);
      g.lineStyle(1, stroke, 0.7);
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(sx + halfW, sy + halfH);
      g.lineTo(sx, sy + iso.TILE_HEIGHT);
      g.lineTo(sx - halfW, sy + halfH);
      g.closePath();
      g.fillPath();
      g.strokePath();

      // Sun-facing edge highlight.
      if (lit > 0.45) {
        g.lineStyle(1, PALETTE.cream, 0.06 + lit * 0.06);
        g.beginPath();
        g.moveTo(sx - halfW * 0.6, sy + halfH * 0.7);
        g.lineTo(sx, sy + halfH * 0.15);
        g.lineTo(sx + halfW * 0.6, sy + halfH * 0.7);
        g.strokePath();
      }
    }
  }

  return g;
};

const blend = (a: number, b: number, t: number): number => {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8) |
    Math.round(ab + (bb - ab) * t)
  );
};
