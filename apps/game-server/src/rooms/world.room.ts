import {
  CLIENT_MESSAGE,
  ChatSendSchema,
  MoveIntentSchema,
  PlayerState,
  TileVec,
  WorldRoomState,
} from '@pixelgame/networking';
import { Room, type Client } from '@colyseus/core';

import { verifyAccessToken, type VerifiedToken } from '../auth/jwt-verifier';
import { ChatSystem } from '../systems/chat.system';
import { MovementSystem } from '../systems/movement.system';

interface JoinOptions {
  accessToken: string;
  roomId?: string;
}

const TICK_HZ = 20;

export class WorldRoom extends Room<WorldRoomState> {
  maxClients = 20;

  private movement!: MovementSystem;
  private chat!: ChatSystem;

  override onCreate(options: { roomId?: string; name?: string }): void {
    this.setState(new WorldRoomState());
    this.state.roomId = options.roomId ?? this.roomId;
    this.state.name = options.name ?? 'Default room';

    this.movement = new MovementSystem(this.state);
    this.chat = new ChatSystem(this.state);

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
      this.chat.broadcast(client, author, parsed.data.body);
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
    player.position = new TileVec().assign({ x: 0, y: 0 });
    player.lastUpdate = Date.now();
    this.state.players.set(client.sessionId, player);
  }

  override onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }

  private tick(deltaMs: number): void {
    this.state.tick += 1;
    this.movement.update(deltaMs);
  }
}
