import { iso } from '@pixelgame/game-core';
import Phaser from 'phaser';

import { useRoomStore, type RoomLayoutSnapshot } from '../../state/room.store';
import { installTilePicker } from '../input/tile-picker';
import { drawFloor } from '../systems/floor.renderer';
import { PlayerSyncSystem } from '../systems/player-sync.system';
import { AMBIENT, CAMERA, PALETTE, SUN, VIGNETTE } from '../theme';

/**
 * Long-lived room scene. Owns the world container, floor graphics,
 * tile picker, the player-sync system, and the atmosphere stack:
 *   - sky gradient (background)
 *   - ambient multiply overlay (full screen, dusk tint)
 *   - sun radial light (additive, in-world)
 *   - vignette (full screen, depth ahead of avatars)
 *
 * Atmosphere layers attached to the main camera with scrollFactor 0
 * stay locked on screen as the camera follows the player.
 */
export class RoomScene extends Phaser.Scene {
  private world!: Phaser.GameObjects.Container;
  private sky!: Phaser.GameObjects.Graphics;
  private ambient!: Phaser.GameObjects.Rectangle;
  private vignette!: Phaser.GameObjects.Graphics;
  private sun: Phaser.GameObjects.Arc | null = null;
  private floor: Phaser.GameObjects.Graphics | null = null;
  private playerSync!: PlayerSyncSystem;
  private uninstallPicker: (() => void) | null = null;
  private unsubscribeStore: (() => void) | null = null;

  private prevLayout: RoomLayoutSnapshot | null = null;
  private prevMySessionId: string | null = null;
  private lastSeenChatIndex = 0;
  private isFollowingMe = false;

  constructor() {
    super('Room');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.void);
    this.cameras.main.setZoom(CAMERA.zoom);

    this.buildSky();

    this.world = this.add.container(this.scale.width / 2, this.scale.height / 4);
    this.playerSync = new PlayerSyncSystem(this, this.world);

    this.buildAmbient();
    this.buildVignette();

    const initial = useRoomStore.getState();
    if (initial.layout) this.applyLayout(initial.layout);
    this.playerSync.sync(initial.players);
    this.lastSeenChatIndex = initial.chatHistory.length;
    this.prevMySessionId = initial.mySessionId;
    this.maybeFollowSelf(initial.mySessionId);

    this.unsubscribeStore = useRoomStore.subscribe((state) => {
      if (state.layout !== this.prevLayout) {
        if (state.layout) this.applyLayout(state.layout);
        else this.clearLayout();
      }
      this.playerSync.sync(state.players);

      if (state.chatHistory.length > this.lastSeenChatIndex) {
        for (let i = this.lastSeenChatIndex; i < state.chatHistory.length; i++) {
          const msg = state.chatHistory[i];
          if (!msg) continue;
          this.playerSync.getSpriteByUser(msg.authorId)?.showBubble(msg.body);
        }
        this.lastSeenChatIndex = state.chatHistory.length;
      }

      if (state.mySessionId !== this.prevMySessionId) {
        this.prevMySessionId = state.mySessionId;
        this.isFollowingMe = false;
      }
      this.maybeFollowSelf(state.mySessionId);
    });

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  private buildSky(): void {
    this.sky = this.add.graphics();
    this.sky.setScrollFactor(0);
    this.sky.setDepth(-1000);
    this.paintSky();
  }

  private paintSky(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.sky.clear();
    // Soft vertical band from plum at top to void at bottom.
    const bands = 24;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const color = blend(PALETTE.plum, PALETTE.void, t);
      this.sky.fillStyle(color, 1);
      this.sky.fillRect(0, (h * i) / bands - 1, w, h / bands + 2);
    }
    // Subtle warm bloom from the sun corner.
    this.sky.fillStyle(PALETTE.amberGlow, 0.06);
    this.sky.fillCircle(w * 0.85, h * 0.18, Math.max(w, h) * 0.55);
  }

  private buildAmbient(): void {
    // Dusk tint, full-screen MULTIPLY.
    this.ambient = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      AMBIENT.color,
      AMBIENT.alpha,
    );
    this.ambient.setScrollFactor(0);
    this.ambient.setDepth(900);
    this.ambient.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  private buildVignette(): void {
    // Vignette = many concentric ellipses with low alpha. Stays in front of
    // ambient but behind chat bubbles (which live inside avatar containers
    // and have unbounded depth in world space).
    this.vignette = this.add.graphics();
    this.vignette.setScrollFactor(0);
    this.vignette.setDepth(950);
    this.paintVignette();
  }

  private paintVignette(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.vignette.clear();
    const rings = 18;
    const maxR = Math.hypot(w, h) * 0.7;
    const minR = Math.min(w, h) * 0.32;
    for (let i = 0; i < rings; i++) {
      const t = i / (rings - 1);
      const r = minR + (maxR - minR) * t;
      const alpha = VIGNETTE.alphaEdge * Math.pow(t, 2);
      this.vignette.fillStyle(VIGNETTE.color, alpha / rings);
      this.vignette.fillEllipse(w / 2, h / 2, r * 2, r * 1.5);
    }
  }

  private applyLayout(layout: RoomLayoutSnapshot): void {
    this.clearLayout();
    this.floor = drawFloor(this, this.world, layout);
    this.uninstallPicker = installTilePicker(this, this.world, layout);

    // Sun radial light inside the world container — follows the room.
    const sunPos = iso.tileToScreen(SUN.tile);
    this.sun = this.add.circle(sunPos.sx, sunPos.sy, 180, PALETTE.sun, SUN.overlayAlpha);
    this.sun.setBlendMode(Phaser.BlendModes.ADD);
    this.sun.setDepth(-90);
    this.world.add(this.sun);

    this.prevLayout = layout;
  }

  private clearLayout(): void {
    if (this.uninstallPicker) {
      this.uninstallPicker();
      this.uninstallPicker = null;
    }
    if (this.floor) {
      this.floor.destroy();
      this.floor = null;
    }
    if (this.sun) {
      this.sun.destroy();
      this.sun = null;
    }
    this.prevLayout = null;
  }

  private maybeFollowSelf(mySessionId: string | null): void {
    if (this.isFollowingMe || !mySessionId) return;
    const sprite = this.playerSync.getSpriteBySession(mySessionId);
    if (sprite) {
      this.cameras.main.startFollow(sprite.container, true, CAMERA.followLerp, CAMERA.followLerp);
      this.isFollowingMe = true;
    }
  }

  private handleResize(): void {
    if (!this.world) return;
    this.world.x = this.scale.width / 2;
    this.world.y = this.scale.height / 4;
    this.ambient.setPosition(this.scale.width / 2, this.scale.height / 2);
    this.ambient.setSize(this.scale.width, this.scale.height);
    this.paintSky();
    this.paintVignette();
  }

  override update(_time: number, delta: number): void {
    this.playerSync.update(delta);
    if (!this.isFollowingMe) this.maybeFollowSelf(this.prevMySessionId);
  }

  shutdown(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.uninstallPicker) {
      this.uninstallPicker();
      this.uninstallPicker = null;
    }
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    if (this.floor) this.floor.destroy();
    if (this.sun) this.sun.destroy();
    if (this.sky) this.sky.destroy();
    if (this.ambient) this.ambient.destroy();
    if (this.vignette) this.vignette.destroy();
    if (this.playerSync) this.playerSync.destroyAll();
    this.floor = null;
    this.sun = null;
    this.prevLayout = null;
    this.isFollowingMe = false;
  }
}

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
