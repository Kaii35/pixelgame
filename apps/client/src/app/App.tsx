import { useRestoreSession } from '../features/auth/use-auth';

import { Providers } from './providers';
import { AppRouter } from './router';

const AppShell = (): JSX.Element => {
  const { status } = useRestoreSession();
  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center gap-3 text-sm text-ink-300">
        <span className="inline-block w-2 h-2 rounded-full bg-sun animate-pulse-soft" />
        <span className="font-display tracking-wide">Restaurando sesión…</span>
      </div>
    );
  }
  return <AppRouter />;
};

export const App = (): JSX.Element => (
  <Providers>
    <AppShell />
  </Providers>
);
