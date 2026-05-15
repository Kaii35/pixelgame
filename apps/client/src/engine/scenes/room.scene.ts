import { iso, room as roomCore } from '@pixelgame/game-core';
import Phaser from 'phaser';

/**
 * Programmatic placeholder scene: draws a 10x10 isometric floor with
 * Phaser graphics — no asset pipeline yet (Fase 3 will introduce sprites).
 */
export class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  override create(): void {
    const layout = roomCore.buildEmptyLayout(10, 10);
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x334155 } });

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        const { sx, sy } = iso.tileToScreen({ x, y });
        const px = cx + sx;
        const py = cy + sy - (layout.height * iso.TILE_HEIGHT) / 2;

        graphics.lineStyle(1, 0x334155, 1);
        graphics.fillStyle(0x1f2937, 1);
        graphics.beginPath();
        graphics.moveTo(px, py);
        graphics.lineTo(px + iso.TILE_WIDTH / 2, py + iso.TILE_HEIGHT / 2);
        graphics.lineTo(px, py + iso.TILE_HEIGHT);
        graphics.lineTo(px - iso.TILE_WIDTH / 2, py + iso.TILE_HEIGHT / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
      }
    }

    this.add
      .text(16, 16, 'Phaser scene online — iso placeholder', {
        fontFamily: 'monospace',
        color: '#cbd5e1',
        fontSize: '14px',
      })
      .setScrollFactor(0);
  }
}
