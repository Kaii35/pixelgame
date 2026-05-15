import { iso } from '@pixelgame/game-core';
import Phaser from 'phaser';

import type { RemotePlayer } from '../../state/room.store';

const TILES_PER_SEC = 5;
const BODY_RADIUS_X = 14;
const BODY_RADIUS_Y = 18;
const BODY_Y_OFFSET = -BODY_RADIUS_Y; // lift so feet sit on tile center

const hashColor = (userId: string): number => {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) | 0;
  }
  const hue = ((h % 360) + 360) % 360;
  // HSL → RGB at fixed S=65%, L=55% for vibrant but readable avatars.
  return Phaser.Display.Color.HSLToColor(hue / 360, 0.65, 0.55).color;
};

interface SpeechBubble {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  hideEvent: Phaser.Time.TimerEvent | null;
}

export class AvatarSprite {
  readonly userId: string;
  readonly sessionId: string;
  readonly container: Phaser.GameObjects.Container;

  private readonly scene: Phaser.Scene;
  private readonly bubble: SpeechBubble;
  private targetTile: { x: number; y: number };
  private renderTile: { x: number; y: number } | null = null;

  constructor(scene: Phaser.Scene, snapshot: RemotePlayer) {
    this.scene = scene;
    this.userId = snapshot.userId;
    this.sessionId = snapshot.sessionId;
    this.targetTile = { x: snapshot.position.x, y: snapshot.position.y };

    this.container = scene.add.container(0, 0);

    // Shadow ellipse on the ground.
    const shadow = scene.add.ellipse(0, 0, BODY_RADIUS_X * 2, BODY_RADIUS_Y * 0.6, 0x000000, 0.35);
    this.container.add(shadow);

    // Body ellipse.
    const bodyColor = hashColor(snapshot.userId);
    const body = scene.add.ellipse(
      0,
      BODY_Y_OFFSET,
      BODY_RADIUS_X * 2,
      BODY_RADIUS_Y * 2,
      bodyColor,
    );
    body.setStrokeStyle(1, 0x000000, 0.6);
    this.container.add(body);

    // Username label above body.
    const label = scene.add.text(0, BODY_Y_OFFSET - BODY_RADIUS_Y - 14, snapshot.username, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e2e8f0',
    });
    label.setOrigin(0.5, 0.5);
    this.container.add(label);

    this.bubble = this.buildBubble();
    this.container.add(this.bubble.container);
  }

  private buildBubble(): SpeechBubble {
    const container = this.scene.add.container(0, BODY_Y_OFFSET - BODY_RADIUS_Y - 32);
    container.setVisible(false);
    const bg = this.scene.add.graphics();
    const text = this.scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#0b1020',
      wordWrap: { width: 180 },
    });
    text.setOrigin(0.5, 0.5);
    container.add(bg);
    container.add(text);
    return { container, bg, text, hideEvent: null };
  }

  setSnapshot(snapshot: RemotePlayer): void {
    this.targetTile = { x: snapshot.position.x, y: snapshot.position.y };
    if (this.renderTile === null) {
      this.renderTile = { x: this.targetTile.x, y: this.targetTile.y };
      this.applyPosition();
    }
  }

  showBubble(body: string, ttlMs = 4000): void {
    const { container, bg, text, hideEvent } = this.bubble;
    if (hideEvent) {
      hideEvent.remove(false);
    }
    text.setText(body);
    const padX = 8;
    const padY = 5;
    const w = Math.max(40, text.width + padX * 2);
    const h = text.height + padY * 2;
    bg.clear();
    bg.fillStyle(0xfef3c7, 1);
    bg.lineStyle(1, 0x78350f, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    // small tail
    bg.fillStyle(0xfef3c7, 1);
    bg.fillTriangle(-4, h / 2, 4, h / 2, 0, h / 2 + 6);
    container.setVisible(true);
    this.bubble.hideEvent = this.scene.time.delayedCall(ttlMs, () => {
      container.setVisible(false);
      this.bubble.hideEvent = null;
    });
  }

  update(deltaMs: number): void {
    if (this.renderTile === null) {
      this.renderTile = { x: this.targetTile.x, y: this.targetTile.y };
    } else {
      const dx = this.targetTile.x - this.renderTile.x;
      const dy = this.targetTile.y - this.renderTile.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1e-4) {
        const step = (TILES_PER_SEC * deltaMs) / 1000;
        if (step >= dist) {
          this.renderTile.x = this.targetTile.x;
          this.renderTile.y = this.targetTile.y;
        } else {
          this.renderTile.x += (dx / dist) * step;
          this.renderTile.y += (dy / dist) * step;
        }
      }
    }
    this.applyPosition();
  }

  private applyPosition(): void {
    if (!this.renderTile) return;
    const { sx, sy } = iso.tileToScreen(this.renderTile);
    this.container.x = sx;
    this.container.y = sy;
    this.container.setDepth(
      iso.depthOf({ x: Math.round(this.renderTile.x), y: Math.round(this.renderTile.y) }),
    );
  }

  destroy(): void {
    if (this.bubble.hideEvent) {
      this.bubble.hideEvent.remove(false);
      this.bubble.hideEvent = null;
    }
    this.container.destroy(true);
  }
}
