import { Client } from 'colyseus.js';

const url = import.meta.env.VITE_GAME_SERVER_URL ?? 'ws://localhost:2567';

export const colyseusClient = new Client(url);
