import { create } from 'zustand';

import type { ChatBroadcast } from '@pixelgame/networking';

/**
 * Single source of truth for in-room state on the client.
 *
 * - The network layer (Colyseus client) WRITES into this store via the *upsert* / *append* / *set* actions.
 * - The engine layer (Phaser) READS from this store via subscriptions.
 * - The UI layer (React) READS from this store via the hook.
 *
 * Never expose Colyseus types here — keep only plain JS values so the engine
 * has zero dependency on the wire format.
 */

export interface RemotePlayer {
  sessionId: string;
  userId: string;
  username: string;
  position: { x: number; y: number };
  path: { x: number; y: number }[];
  emote: string;
  lastUpdate: number;
}

export interface RoomLayoutSnapshot {
  width: number;
  height: number;
  spawn: { x: number; y: number };
}

interface RoomState {
  connected: boolean;
  mySessionId: string | null;
  roomId: string | null;
  layout: RoomLayoutSnapshot | null;
  players: Record<string, RemotePlayer>;
  chatHistory: ChatBroadcast[];

  sendMoveIntent: ((to: { x: number; y: number }) => void) | null;
  sendChat: ((body: string) => void) | null;
}

interface RoomActions {
  setConnected(connected: boolean, mySessionId: string | null, roomId: string | null): void;
  setLayout(layout: RoomLayoutSnapshot): void;
  upsertPlayer(player: RemotePlayer): void;
  patchPlayer(sessionId: string, patch: Partial<RemotePlayer>): void;
  removePlayer(sessionId: string): void;
  appendChat(msg: ChatBroadcast): void;
  setSendMoveIntent(fn: ((to: { x: number; y: number }) => void) | null): void;
  setSendChat(fn: ((body: string) => void) | null): void;
  reset(): void;
}

const initialState: RoomState = {
  connected: false,
  mySessionId: null,
  roomId: null,
  layout: null,
  players: {},
  chatHistory: [],
  sendMoveIntent: null,
  sendChat: null,
};

const CHAT_LIMIT = 50;

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,
  setConnected: (connected, mySessionId, roomId) => set({ connected, mySessionId, roomId }),
  setLayout: (layout) => set({ layout }),
  upsertPlayer: (player) => set((s) => ({ players: { ...s.players, [player.sessionId]: player } })),
  patchPlayer: (sessionId, patch) =>
    set((s) => {
      const existing = s.players[sessionId];
      if (!existing) return s;
      return { players: { ...s.players, [sessionId]: { ...existing, ...patch } } };
    }),
  removePlayer: (sessionId) =>
    set((s) => {
      if (!(sessionId in s.players)) return s;
      const next = { ...s.players };
      delete next[sessionId];
      return { players: next };
    }),
  appendChat: (msg) =>
    set((s) => {
      const next = [...s.chatHistory, msg];
      if (next.length > CHAT_LIMIT) next.splice(0, next.length - CHAT_LIMIT);
      return { chatHistory: next };
    }),
  setSendMoveIntent: (fn) => set({ sendMoveIntent: fn }),
  setSendChat: (fn) => set({ sendChat: fn }),
  reset: () => set({ ...initialState }),
}));
