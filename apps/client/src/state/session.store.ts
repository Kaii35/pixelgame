import { create } from 'zustand';

import type { PrivateUser } from '@pixelgame/shared-types';

interface SessionState {
  user: PrivateUser | null;
  accessToken: string | null;
  setSession: (user: PrivateUser, accessToken: string) => void;
  setAccessToken: (token: string | null) => void;
  hydrate: (user: PrivateUser, accessToken: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (token) => set({ accessToken: token }),
  hydrate: (user, accessToken) => set({ user, accessToken }),
  clear: () => set({ user: null, accessToken: null }),
}));
