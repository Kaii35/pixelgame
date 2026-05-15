import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useLoginMutation } from './use-auth';

export const LoginScreen = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useLoginMutation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <main className="relative flex h-full items-center justify-center overflow-hidden px-6">
      <AuthBackdrop />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm glass-strong rounded-3xl p-8 animate-fade-in"
      >
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sun to-amber mb-3 shadow-glow">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-50">Bienvenido</h1>
          <p className="mt-1 text-sm text-ink-300">Entra para reunirte con todos</p>
        </div>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-300">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-1.5"
            placeholder="tu@email.com"
          />
        </label>

        <label className="block mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-300">
            Contraseña
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-1.5"
            placeholder="••••••••"
          />
        </label>

        {mutation.isError ? (
          <p className="mt-4 text-sm text-magenta text-center animate-fade-in">
            No pudimos iniciar sesión. Verifica tus credenciales.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary w-full mt-6 py-2.5"
        >
          {mutation.isPending ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="mt-6 text-center text-sm text-ink-300">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="text-sun hover:text-cream transition-colors">
            Crear una
          </Link>
        </p>
      </form>
    </main>
  );
};

const AuthBackdrop = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        'radial-gradient(ellipse at 70% 20%, rgba(255,184,107,0.18) 0%, transparent 55%), radial-gradient(ellipse at 25% 85%, rgba(127,223,255,0.10) 0%, transparent 55%)',
    }}
  />
);
