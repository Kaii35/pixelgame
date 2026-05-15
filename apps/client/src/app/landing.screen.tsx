import { Button } from '@pixelgame/shared-ui';

export const LandingScreen = (): JSX.Element => (
  <main className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
    <h1 className="text-4xl font-bold tracking-tight">Pixelgame</h1>
    <p className="max-w-md text-slate-300">
      Social MMO web platform — Fase 0 scaffold listo. Implementa auth en{' '}
      <code className="rounded bg-slate-800 px-1.5 py-0.5">apps/api</code> y conecta al cliente
      desde <code className="rounded bg-slate-800 px-1.5 py-0.5">src/features/auth</code>.
    </p>
    <Button variant="primary" size="lg" onClick={() => alert('Coming soon')}>
      Entrar
    </Button>
  </main>
);
