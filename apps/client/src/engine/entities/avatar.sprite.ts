import { iso } from '@pixelgame/game-core';
import Phaser from 'phaser';

import { AVATAR, PALETTE } from '../theme';

import type { RemotePlayer } from '../../state/room.store';

const TILES_PER_SEC = 5;

const hashColor = (userId: string): { body: number; head: number; halo: number } => {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0;
  const hue = ((h % 360) + 360) % 360;
  const body = Phaser.Display.Color.HSLToColor(hue / 360, 0.55, 0.5).color;
  const head = Phaser.Display.Color.HSLToColor(hue / 360, 0.4, 0.78).color;
  const halo = Phaser.Display.Color.HSLToColor(hue / 360, 0.7, 0.65).color;
  return { body, head, halo };
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
  private haloPulse = 0;
  private readonly halo: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, snapshot: RemotePlayer) {
    this.scene = scene;
    this.userId = snapshot.userId;
    this.sessionId = snapshot.sessionId;
    this.targetTile = { x: snapshot.position.x, y: snapshot.position.y };

    const colors = hashColor(snapshot.userId);
    this.container = scene.add.container(0, 0);

    // Halo (ADD blend, sits below body).
    this.halo = scene.add.ellipse(0, 0, AVATAR.haloW, AVATAR.haloH, colors.halo, 0.18);
    this.halo.setBlendMode(Phaser.BlendModes.ADD);
    this.container.add(this.halo);

    // Ground shadow.
    const shadow = scene.add.ellipse(0, 0, AVATAR.shadowW, AVATAR.shadowH, 0x000000, 0.45);
    this.container.add(shadow);

    // Body: rounded rectangle via graphics for crisp edges.
    const body = scene.add.graphics();
    body.fillStyle(colors.body, 1);
    body.lineStyle(1, 0x000000, 0.5);
    body.fillRoundedRect(
      -AVATAR.bodyW / 2,
      AVATAR.bodyOffsetY - AVATAR.bodyH / 2,
      AVATAR.bodyW,
      AVATAR.bodyH,
      6,
    );
    body.strokeRoundedRect(
      -AVATAR.bodyW / 2,
      AVATAR.bodyOffsetY - AVATAR.bodyH / 2,
      AVATAR.bodyW,
      AVATAR.bodyH,
      6,
    );
    // Soft inner highlight stripe on top of the body.
    body.fillStyle(PALETTE.cream, 0.06);
    body.fillRoundedRect(
      -AVATAR.bodyW / 2 + 2,
      AVATAR.bodyOffsetY - AVATAR.bodyH / 2 + 2,
      AVATAR.bodyW - 4,
      4,
      3,
    );
    this.container.add(body);

    // Head.
    const head = scene.add.circle(0, AVATAR.headOffsetY, AVATAR.headR, colors.head);
    head.setStrokeStyle(1, 0x000000, 0.5);
    this.container.add(head);

    // Username label.
    const label = scene.add.text(0, AVATAR.labelOffsetY, snapshot.username, {
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '11px',
      color: '#f1f5fb',
      stroke: '#0a0f1e',
      strokeThickness: 3,
    });
    label.setOrigin(0.5, 0.5);
    this.container.add(label);

    this.bubble = this.buildBubble();
    this.container.add(this.bubble.container);
  }

  private buildBubble(): SpeechBubble {
    const container = this.scene.add.container(0, AVATAR.labelOffsetY - 18);
    container.setVisible(false);
    const bg = this.scene.add.graphics();
    const text = this.scene.add.text(0, 0, '', {
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '12px',
      color: '#1a1408',
      wordWrap: { width: 200 },
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

  showBubble(body: string, ttlMs = 4500): void {
    const { container, bg, text, hideEvent } = this.bubble;
    if (hideEvent) hideEvent.remove(false);
    text.setText(body);
    const padX = 10;
    const padY = 6;
    const w = Math.max(48, text.width + padX * 2);
    const h = text.height + padY * 2;
    bg.clear();
    // Soft drop shadow.
    bg.fillStyle(PALETTE.void, 0.45);
    bg.fillRoundedRect(-w / 2 + 1, -h / 2 + 2, w, h, 9);
    // Cream pill.
    bg.fillStyle(PALETTE.cream, 1);
    bg.lineStyle(1, 0xb45a1c, 0.35);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 9);
    // Tail pointing down.
    bg.fillStyle(PALETTE.cream, 1);
    bg.fillTriangle(-5, h / 2 - 1, 5, h / 2 - 1, 0, h / 2 + 6);
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

    this.haloPulse += deltaMs * 0.003;
    this.halo.setScale(1 + Math.sin(this.haloPulse) * 0.05);

    this.applyPosition();
  }

  private applyPosition(): void {
    if (!this.renderTile) return;
    const { sx, sy } = iso.tileToScreen(this.renderTile);
    // Snap container to the BOTTOM of the tile so the avatar "stands" on it.
    this.container.x = sx;
    this.container.y = sy + iso.TILE_HEIGHT / 2;
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
