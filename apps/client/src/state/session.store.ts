import type { PrivateUser } from '@pixelgame/shared-types';
import { create } from 'zustand';

interface SessionState {
  user: PrivateUser | null;
  accessToken: string | null;
  setSession: (user: PrivateUser, accessToken: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => set({ user, accessToken }),
  clear: () => set({ user: null, accessToken: null }),
}));
