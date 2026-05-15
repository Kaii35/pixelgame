import { iso } from '@pixelgame/game-core';
import Phaser from 'phaser';

import { PALETTE } from '../theme';

import type { FurnitureSnapshot } from '../../state/room.store';

/**
 * Programmatic furniture sprite. Each catalog kind has a tiny vector
 * routine that draws into a Container. No assets shipped — visuals are
 * placeholders that read as intentional design.
 */
export class FurnitureSprite {
  readonly id: string;
  readonly kind: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly tile: { x: number; y: number };

  constructor(scene: Phaser.Scene, snapshot: FurnitureSnapshot) {
    this.id = snapshot.id;
    this.kind = snapshot.kind;
    this.tile = { x: snapshot.tile.x, y: snapshot.tile.y };

    this.container = scene.add.container(0, 0);
    paintFurniture(scene, this.container, snapshot.kind);
    this.applyPosition();
  }

  applyPosition(): void {
    const { sx, sy } = iso.tileToScreen(this.tile);
    this.container.x = sx;
    this.container.y = sy + iso.TILE_HEIGHT / 2;
    this.container.setDepth(iso.depthOf(this.tile));
  }

  destroy(): void {
    this.container.destroy(true);
  }
}

/**
 * Paint a furniture kind into the given container. Centered at (0,0) so
 * positioning is handled by the caller. The container Y origin is the
 * BOTTOM of the tile (matching avatars), so visuals are drawn at negative Y.
 */
const paintFurniture = (
  scene: Phaser.Scene,
  c: Phaser.GameObjects.Container,
  kind: string,
): void => {
  const shadow = scene.add.ellipse(0, 0, 30, 9, 0x000000, 0.45);
  c.add(shadow);

  switch (kind) {
    case 'plant_fern':
      return paintFern(scene, c);
    case 'lamp_floor':
      return paintLamp(scene, c);
    case 'sofa_soft':
      return paintSofa(scene, c);
    case 'table_round':
      return paintTable(scene, c);
    case 'rug_woven':
      return paintRug(scene, c);
    case 'bookshelf':
      return paintBookshelf(scene, c);
    default:
      return paintUnknown(scene, c);
  }
};

const paintFern = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  // Planter
  const planter = scene.add.graphics();
  planter.fillStyle(0x4a3322, 1);
  planter.fillRoundedRect(-10, -16, 20, 10, 2);
  planter.lineStyle(1, 0x000000, 0.4);
  planter.strokeRoundedRect(-10, -16, 20, 10, 2);
  c.add(planter);
  // Leaves
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + ((i - 2.5) * Math.PI) / 9;
    const len = 16 + (i % 2) * 4;
    const ex = Math.cos(a) * len;
    const ey = -16 + Math.sin(a) * len;
    const leaf = scene.add.ellipse(ex / 2, (ey + -16) / 2, len, 5, PALETTE.moss);
    leaf.setRotation(a + Math.PI / 2);
    c.add(leaf);
  }
};

const paintLamp = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  // Base
  const base = scene.add.graphics();
  base.fillStyle(0x252a3a, 1);
  base.fillEllipse(0, -2, 14, 5);
  c.add(base);
  // Pole
  const pole = scene.add.rectangle(0, -22, 2, 40, 0x252a3a);
  c.add(pole);
  // Bulb halo
  const halo = scene.add.ellipse(0, -42, 28, 28, PALETTE.sun, 0.25);
  halo.setBlendMode(Phaser.BlendModes.ADD);
  c.add(halo);
  // Bulb
  const bulb = scene.add.circle(0, -42, 6, PALETTE.cream);
  bulb.setStrokeStyle(1, 0xb45a1c, 0.5);
  c.add(bulb);
};

const paintSofa = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  const g = scene.add.graphics();
  // Back
  g.fillStyle(0x322a4a, 1);
  g.fillRoundedRect(-22, -28, 44, 14, 4);
  // Seat
  g.fillStyle(PALETTE.plum, 1);
  g.fillRoundedRect(-24, -18, 48, 12, 4);
  // Arms
  g.fillStyle(0x322a4a, 1);
  g.fillRoundedRect(-26, -22, 6, 18, 3);
  g.fillRoundedRect(20, -22, 6, 18, 3);
  // Cushion highlight
  g.fillStyle(PALETTE.cream, 0.08);
  g.fillRoundedRect(-22, -16, 44, 3, 2);
  c.add(g);
};

const paintTable = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  // Tabletop (iso ellipse)
  const top = scene.add.ellipse(0, -16, 30, 14, PALETTE.slateLit);
  top.setStrokeStyle(1, 0x141a26, 0.6);
  c.add(top);
  // Top highlight
  const hi = scene.add.ellipse(0, -17, 24, 4, PALETTE.cream, 0.12);
  c.add(hi);
  // Pedestal
  const ped = scene.add.rectangle(0, -8, 6, 12, PALETTE.slate);
  c.add(ped);
};

const paintRug = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  // No shadow for rug — it IS the ground decoration. Remove the prepended shadow.
  const list = c.list as Phaser.GameObjects.GameObject[];
  if (list.length > 0) {
    list[0]?.destroy();
  }
  const rug = scene.add.ellipse(0, -1, 50, 22, PALETTE.amberGlow, 0.85);
  rug.setStrokeStyle(2, 0x7a3e1a, 0.7);
  c.add(rug);
  // Pattern
  const p = scene.add.graphics();
  p.lineStyle(1, PALETTE.cream, 0.4);
  for (let i = -2; i <= 2; i++) {
    p.strokeEllipse(0, -1, 16 - Math.abs(i) * 4, 7);
  }
  c.add(p);
};

const paintBookshelf = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  const g = scene.add.graphics();
  // Case
  g.fillStyle(0x2a1f15, 1);
  g.fillRoundedRect(-16, -52, 32, 50, 2);
  g.lineStyle(1, 0x000000, 0.5);
  g.strokeRoundedRect(-16, -52, 32, 50, 2);
  // Shelves
  g.fillStyle(0x140d09, 1);
  for (let i = 0; i < 3; i++) {
    g.fillRect(-14, -46 + i * 14, 28, 1);
  }
  // Books (multi-color)
  const bookColors = [PALETTE.magenta, PALETTE.cyan, PALETTE.moss, PALETTE.sun, PALETTE.cream];
  for (let row = 0; row < 3; row++) {
    let x = -13;
    while (x < 13) {
      const w = 2 + Math.floor((row * 7 + x * 3) % 4);
      const color = bookColors[(row + x) & 3] ?? PALETTE.cyan;
      g.fillStyle(color, 0.85);
      g.fillRect(x, -44 + row * 14, w, 11);
      x += w + 1;
    }
  }
  c.add(g);
};

const paintUnknown = (scene: Phaser.Scene, c: Phaser.GameObjects.Container): void => {
  const g = scene.add.graphics();
  g.fillStyle(PALETTE.magenta, 0.6);
  g.fillRoundedRect(-10, -22, 20, 22, 3);
  c.add(g);
};
