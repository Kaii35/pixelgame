import { Room, type Client } from '@colyseus/core';
import {
  CLIENT_MESSAGE,
  ChatSendSchema,
  MoveIntentSchema,
  PlaceFurnitureSchema,
  PlayerState,
  RemoveFurnitureSchema,
  TileVec,
  WorldRoomState,
} from '@pixelgame/networking';

import { verifyAccessToken, type VerifiedToken } from '../auth/jwt-verifier';
import { defaultLayout } from '../domain/world-layout';
import { ChatSystem } from '../systems/chat.system';
import { DecorationSystem } from '../systems/decoration.system';
import { MovementSystem } from '../systems/movement.system';

import type { RoomLayout } from '@pixelgame/shared-types';

interface JoinOptions {
  accessToken: string;
  roomId?: string;
}

const TICK_HZ = 20;

export class WorldRoom extends Room<WorldRoomState> {
  override maxClients = 20;

  private movement!: MovementSystem;
  private chat!: ChatSystem;
  private decoration!: DecorationSystem;
  private layout!: RoomLayout;

  override onCreate(options: { roomId?: string; name?: string }): void {
    this.setState(new WorldRoomState());
    this.state.roomId = options.roomId ?? this.roomId;
    this.state.name = options.name ?? 'Default room';

    this.layout = defaultLayout();

    this.movement = new MovementSystem(this.state, this.layout);
    this.chat = new ChatSystem(this.state, (type, payload) => this.broadcast(type, payload));
    this.decoration = new DecorationSystem(this.state, this.layout);

    this.onMessage(CLIENT_MESSAGE.MOVE_INTENT, (client, payload) => {
      const parsed = MoveIntentSchema.safeParse(payload);
      if (!parsed.success) return;
      this.movement.handleIntent(client.sessionId, parsed.data);
    });

    this.onMessage(CLIENT_MESSAGE.CHAT_SEND, (client, payload) => {
      const parsed = ChatSendSchema.safeParse(payload);
      if (!parsed.success) return;
      const author = client.userData as VerifiedToken | undefined;
      if (!author) return;
      this.chat.broadcast(author, parsed.data.body, client.sessionId);
    });

    this.onMessage(CLIENT_MESSAGE.PLACE_FURNITURE, (client, payload) => {
      const parsed = PlaceFurnitureSchema.safeParse(payload);
      if (!parsed.success) return;
      const author = client.userData as VerifiedToken | undefined;
      if (!author) return;
      this.decoration.place(client.sessionId, author, parsed.data);
    });

    this.onMessage(CLIENT_MESSAGE.REMOVE_FURNITURE, (client, payload) => {
      const parsed = RemoveFurnitureSchema.safeParse(payload);
      if (!parsed.success) return;
      const author = client.userData as VerifiedToken | undefined;
      if (!author) return;
      this.decoration.remove(client.sessionId, author, parsed.data.furnitureId);
    });

    this.setSimulationInterval(this.tick.bind(this), 1000 / TICK_HZ);
  }

  override async onAuth(_client: Client, options: JoinOptions): Promise<VerifiedToken> {
    if (!options?.accessToken) throw new Error('missing_access_token');
    return verifyAccessToken(options.accessToken);
  }

  override onJoin(client: Client, _opts: JoinOptions, auth: VerifiedToken): void {
    client.userData = auth;
    const player = new PlayerState();
    player.userId = auth.userId;
    player.username = auth.username;
    player.position = new TileVec().assign({ x: this.layout.spawn.x, y: this.layout.spawn.y });
    player.lastUpdate = Date.now();
    this.state.players.set(client.sessionId, player);
  }

  override onLeave(client: Client): void {
    this.movement.onLeave(client.sessionId);
    this.chat.onLeave(client.sessionId);
    this.decoration.onLeave(client.sessionId);
    this.state.players.delete(client.sessionId);
  }

  private tick(deltaMs: number): void {
    this.state.tick += 1;
    this.movement.update(deltaMs);
  }
}
