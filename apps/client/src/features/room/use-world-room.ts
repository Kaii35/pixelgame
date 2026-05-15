import {
  CLIENT_MESSAGE,
  SERVER_MESSAGE,
  type ChatBroadcast,
  type PlayerState,
  type WorldRoomState,
} from '@pixelgame/networking';
import { getStateCallbacks, type Room } from 'colyseus.js';
import { useEffect, useState } from 'react';

import { joinWorldRoom } from '../../network/rooms/world-room.client';
import { useRoomStore } from '../../state/room.store';
import { useSessionStore } from '../../state/session.store';

export type WorldRoomStatus = 'connecting' | 'connected' | 'error';

export interface UseWorldRoomResult {
  status: WorldRoomStatus;
  error?: string;
}

const snapshotPath = (player: PlayerState): { x: number; y: number }[] =>
  Array.from(player.path).map((t) => ({ x: t.x, y: t.y }));

export const useWorldRoom = (roomId: string): UseWorldRoomResult => {
  const [status, setStatus] = useState<WorldRoomStatus>('connecting');
  const [error, setError] = useState<string | undefined>(undefined);
  const accessToken = useSessionStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      setStatus('error');
      setError('Not authenticated');
      return;
    }

    let cancelled = false;
    let joinedRoom: Room<WorldRoomState> | null = null;
    const store = useRoomStore.getState();
    store.reset();

    const connect = async (): Promise<void> => {
      try {
        const room = await joinWorldRoom({ accessToken, roomId });
        if (cancelled) {
          room.leave();
          return;
        }
        joinedRoom = room;

        // Using @colyseus/schema v3 callbacks API (colyseus.js >= 0.16).
        const $ = getStateCallbacks(room);

        $(room.state).players.onAdd((player, sessionId) => {
          const s = useRoomStore.getState();
          s.upsertPlayer({
            sessionId,
            userId: player.userId,
            username: player.username,
            position: { x: player.position.x, y: player.position.y },
            path: snapshotPath(player),
            emote: player.emote,
            lastUpdate: player.lastUpdate,
          });
          $(player).listen('emote', (value) => {
            useRoomStore.getState().patchPlayer(sessionId, { emote: value });
          });
          // Position is a sub-schema; observe whole-player changes for portability.
          $(player).onChange(() => {
            useRoomStore.getState().patchPlayer(sessionId, {
              position: { x: player.position.x, y: player.position.y },
              path: snapshotPath(player),
              lastUpdate: player.lastUpdate,
            });
          });
        });

        $(room.state).players.onRemove((_player, sessionId) => {
          useRoomStore.getState().removePlayer(sessionId);
        });

        room.onMessage<ChatBroadcast>(SERVER_MESSAGE.CHAT_BROADCAST, (msg) => {
          useRoomStore.getState().appendChat(msg);
        });

        room.onLeave(() => {
          const s2 = useRoomStore.getState();
          s2.setConnected(false, null, null);
          s2.setSendMoveIntent(null);
          s2.setSendChat(null);
        });

        room.onError((_code, message) => {
          setStatus('error');
          setError(message ?? 'Room error');
        });

        // TODO: sync layout via WorldRoomState once schema includes it.
        store.setLayout({ width: 12, height: 12, spawn: { x: 6, y: 6 } });

        store.setSendMoveIntent((to) => {
          room.send(CLIENT_MESSAGE.MOVE_INTENT, { to, clientTime: Date.now() });
        });
        store.setSendChat((body) => {
          room.send(CLIENT_MESSAGE.CHAT_SEND, { body });
        });

        store.setConnected(true, room.sessionId, roomId);
        setStatus('connected');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to join room');
      }
    };

    void connect();

    return () => {
      cancelled = true;
      const s = useRoomStore.getState();
      s.setSendMoveIntent(null);
      s.setSendChat(null);
      if (joinedRoom) {
        joinedRoom.leave();
      }
      s.reset();
    };
  }, [accessToken, roomId]);

  return error !== undefined ? { status, error } : { status };
};
