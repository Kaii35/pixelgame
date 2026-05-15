import { Navigate } from 'react-router-dom';

import { useSessionStore } from '../../state/session.store';

import type { PropsWithChildren } from 'react';

export const AuthGuard = ({ children }: PropsWithChildren): JSX.Element => {
  const accessToken = useSessionStore((s) => s.accessToken);
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
