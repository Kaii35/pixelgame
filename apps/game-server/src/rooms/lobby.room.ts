import { LobbyRoomState } from '@pixelgame/networking';
import { Room, type Client } from '@colyseus/core';

import { verifyAccessToken, type VerifiedToken } from '../auth/jwt-verifier';

interface JoinOptions {
  accessToken: string;
}

export class LobbyRoom extends Room<LobbyRoomState> {
  override onCreate(): void {
    this.setState(new LobbyRoomState());
    this.autoDispose = false;
  }

  override async onAuth(_client: Client, options: JoinOptions): Promise<VerifiedToken> {
    if (!options?.accessToken) throw new Error('missing_access_token');
    return verifyAccessToken(options.accessToken);
  }

  override onJoin(client: Client, _opts: JoinOptions, auth: VerifiedToken): void {
    client.userData = auth;
  }

  override onLeave(_client: Client): void {
    // noop for MVP
  }
}
