import { useRestoreSession } from '../features/auth/use-auth';

import { Providers } from './providers';
import { AppRouter } from './router';

const AppShell = (): JSX.Element => {
  const { status } = useRestoreSession();
  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading…</div>
    );
  }
  return <AppRouter />;
};

export const App = (): JSX.Element => (
  <Providers>
    <AppShell />
  </Providers>
);
