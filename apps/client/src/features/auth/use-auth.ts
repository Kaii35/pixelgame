import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchMe, login, logout, refresh, register, type AuthResponse } from '../../api/auth.api';
import { useSessionStore } from '../../state/session.store';

import type { LoginRequest, RegisterRequest } from '@pixelgame/shared-types';

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (body) => register(body),
    onSuccess: async (data) => {
      // Re-fetch full PrivateUser shape so the session store has the email field.
      const me = await fetchMe(data.accessToken);
      setSession(me, data.accessToken);
      navigate('/lobby', { replace: true });
    },
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (body) => login(body),
    onSuccess: async (data) => {
      const me = await fetchMe(data.accessToken);
      setSession(me, data.accessToken);
      navigate('/lobby', { replace: true });
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const clear = useSessionStore((s) => s.clear);
  const accessToken = useSessionStore((s) => s.accessToken);
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (accessToken) {
        await logout(accessToken);
      }
    },
    onSettled: () => {
      clear();
      navigate('/login', { replace: true });
    },
  });
};

export type RestoreStatus = 'idle' | 'loading' | 'ready';

export const useRestoreSession = (): { status: RestoreStatus } => {
  const hydrate = useSessionStore((s) => s.hydrate);
  const [status, setStatus] = useState<RestoreStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    const restore = async (): Promise<void> => {
      try {
        const { accessToken } = await refresh();
        const me = await fetchMe(accessToken);
        if (!cancelled) {
          hydrate(me, accessToken);
        }
      } catch {
        // No active session — silently leave session empty.
      } finally {
        if (!cancelled) setStatus('ready');
      }
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  return { status };
};
