import { apiFetch } from './client';

import type { RoomSummary } from '@pixelgame/shared-types';


export const listRooms = (): Promise<RoomSummary[]> =>
  apiFetch<RoomSummary[]>('/rooms', { method: 'GET' });
