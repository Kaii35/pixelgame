import { iso } from '@pixelgame/game-core';

import { CLICK_RING } from '../theme';

import type Phaser from 'phaser';


/**
 * Spawn a one-shot expanding ring at the given tile inside the world
 * container. Auto-destroys after the animation finishes.
 */
export const spawnClickRing = (
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  tile: { x: number; y: number },
): void => {
  const { sx, sy } = iso.tileToScreen(tile);
  const g = scene.add.graphics();
  g.x = sx;
  g.y = sy + iso.TILE_HEIGHT / 2;
  g.setDepth(iso.depthOf(tile) - 0.5);
  parent.add(g);

  const state = { radius: CLICK_RING.startRadius, alpha: 0.9 };
  scene.tweens.add({
    targets: state,
    radius: CLICK_RING.endRadius,
    alpha: 0,
    duration: CLICK_RING.durationMs,
    ease: 'Cubic.easeOut',
    onUpdate: () => {
      g.clear();
      g.lineStyle(2, CLICK_RING.color, state.alpha);
      g.strokeEllipse(0, 0, state.radius * 2, state.radius);
    },
    onComplete: () => g.destroy(),
  });
};
