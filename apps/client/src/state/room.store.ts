import { create } from 'zustand';

import type { ChatBroadcast } from '@pixelgame/networking';

/**
 * Single source of truth for in-room state on the client.
 *
 * - The network layer (Colyseus client) WRITES into this store via the
 *   *upsert* / *append* / *set* actions.
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

export interface FurnitureSnapshot {
  id: string;
  kind: string;
  tile: { x: number; y: number };
  ownerId: string;
  placedAt: number;
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
  furniture: Record<string, FurnitureSnapshot>;
  chatHistory: ChatBroadcast[];

  // Decoration UX
  editMode: boolean;
  selectedKind: string | null;

  // Bound after a successful join.
  sendMoveIntent: ((to: { x: number; y: number }) => void) | null;
  sendChat: ((body: string) => void) | null;
  sendPlaceFurniture: ((kind: string, tile: { x: number; y: number }) => void) | null;
  sendRemoveFurniture: ((furnitureId: string) => void) | null;
}

interface RoomActions {
  setConnected(connected: boolean, mySessionId: string | null, roomId: string | null): void;
  setLayout(layout: RoomLayoutSnapshot): void;
  upsertPlayer(player: RemotePlayer): void;
  patchPlayer(sessionId: string, patch: Partial<RemotePlayer>): void;
  removePlayer(sessionId: string): void;
  upsertFurniture(piece: FurnitureSnapshot): void;
  removeFurniture(id: string): void;
  appendChat(msg: ChatBroadcast): void;

  setEditMode(on: boolean): void;
  setSelectedKind(kind: string | null): void;

  setSendMoveIntent(fn: ((to: { x: number; y: number }) => void) | null): void;
  setSendChat(fn: ((body: string) => void) | null): void;
  setSendPlaceFurniture(fn: ((kind: string, tile: { x: number; y: number }) => void) | null): void;
  setSendRemoveFurniture(fn: ((furnitureId: string) => void) | null): void;
  reset(): void;
}

const initialState: RoomState = {
  connected: false,
  mySessionId: null,
  roomId: null,
  layout: null,
  players: {},
  furniture: {},
  chatHistory: [],
  editMode: false,
  selectedKind: null,
  sendMoveIntent: null,
  sendChat: null,
  sendPlaceFurniture: null,
  sendRemoveFurniture: null,
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
  upsertFurniture: (piece) => set((s) => ({ furniture: { ...s.furniture, [piece.id]: piece } })),
  removeFurniture: (id) =>
    set((s) => {
      if (!(id in s.furniture)) return s;
      const next = { ...s.furniture };
      delete next[id];
      return { furniture: next };
    }),
  appendChat: (msg) =>
    set((s) => {
      const next = [...s.chatHistory, msg];
      if (next.length > CHAT_LIMIT) next.splice(0, next.length - CHAT_LIMIT);
      return { chatHistory: next };
    }),
  setEditMode: (on) => set((s) => ({ editMode: on, selectedKind: on ? s.selectedKind : null })),
  setSelectedKind: (kind) => set({ selectedKind: kind }),
  setSendMoveIntent: (fn) => set({ sendMoveIntent: fn }),
  setSendChat: (fn) => set({ sendChat: fn }),
  setSendPlaceFurniture: (fn) => set({ sendPlaceFurniture: fn }),
  setSendRemoveFurniture: (fn) => set({ sendRemoveFurniture: fn }),
  reset: () => set({ ...initialState }),
}));
