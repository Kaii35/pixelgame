import { Server } from '@colyseus/core';
import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
import { createServer } from 'node:http';

import { env } from './config/env';
import { LobbyRoom } from './rooms/lobby.room';
import { WorldRoom } from './rooms/world.room';

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: Date.now() }));
app.use('/colyseus', monitor());

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define('lobby', LobbyRoom);
gameServer.define('world', WorldRoom);

gameServer.listen(env.GAME_SERVER_PORT, env.GAME_SERVER_HOST).then(() => {
  // eslint-disable-next-line no-console
  console.warn(`[game-server] listening on ws://${env.GAME_SERVER_HOST}:${env.GAME_SERVER_PORT}`);
});
