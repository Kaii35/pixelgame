import Phaser from 'phaser';

import { useRoomStore, type RoomLayoutSnapshot } from '../../state/room.store';
import { installTilePicker } from '../input/tile-picker';
import { drawFloor } from '../systems/floor.renderer';
import { PlayerSyncSystem } from '../systems/player-sync.system';

/**
 * Long-lived room scene. Owns the world container, floor graphics,
 * tile picker, and the player-sync system. All inputs come from the
 * room store; no direct network access here.
 */
export class RoomScene extends Phaser.Scene {
  private world!: Phaser.GameObjects.Container;
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
    this.world = this.add.container(this.scale.width / 2, this.scale.height / 4);
    this.playerSync = new PlayerSyncSystem(this, this.world);

    const initial = useRoomStore.getState();
    if (initial.layout) {
      this.applyLayout(initial.layout);
    }
    this.playerSync.sync(initial.players);
    this.lastSeenChatIndex = initial.chatHistory.length;
    this.prevMySessionId = initial.mySessionId;
    this.maybeFollowSelf(initial.mySessionId);

    this.unsubscribeStore = useRoomStore.subscribe((state) => {
      if (state.layout !== this.prevLayout) {
        if (state.layout) {
          this.applyLayout(state.layout);
        } else {
          this.clearLayout();
        }
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

  private applyLayout(layout: RoomLayoutSnapshot): void {
    this.clearLayout();
    this.floor = drawFloor(this, this.world, layout);
    this.uninstallPicker = installTilePicker(this, this.world, layout);
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
    this.prevLayout = null;
  }

  private maybeFollowSelf(mySessionId: string | null): void {
    if (this.isFollowingMe || !mySessionId) return;
    const sprite = this.playerSync.getSpriteBySession(mySessionId);
    if (sprite) {
      this.cameras.main.startFollow(sprite.container, true, 0.15, 0.15);
      this.isFollowingMe = true;
    }
  }

  private handleResize(): void {
    if (!this.world) return;
    this.world.x = this.scale.width / 2;
    this.world.y = this.scale.height / 4;
  }

  override update(_time: number, delta: number): void {
    this.playerSync.update(delta);
    // Late camera follow attempt for clients that join before their sprite exists.
    if (!this.isFollowingMe) {
      this.maybeFollowSelf(this.prevMySessionId);
    }
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
    if (this.floor) {
      this.floor.destroy();
      this.floor = null;
    }
    if (this.playerSync) {
      this.playerSync.destroyAll();
    }
    this.prevLayout = null;
    this.isFollowingMe = false;
  }
}
