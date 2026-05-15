import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useRegisterMutation } from './use-auth';

export const RegisterScreen = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useRegisterMutation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    mutation.mutate({ email, username, password });
  };

  return (
    <main className="relative flex h-full items-center justify-center overflow-hidden px-6">
      <Backdrop />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm glass-strong rounded-3xl p-8 animate-fade-in"
      >
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan to-moss mb-3 shadow-[0_0_24px_-4px_rgba(127,223,255,0.45)]">
            <span className="text-2xl">✿</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-50">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-ink-300">Empieza tu primera sala</p>
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
            Nombre de usuario
          </span>
          <input
            type="text"
            required
            autoComplete="username"
            minLength={3}
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field mt-1.5"
            placeholder="elektra"
          />
        </label>

        <label className="block mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-300">
            Contraseña
          </span>
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-1.5"
            placeholder="mínimo 8 caracteres"
          />
        </label>

        {mutation.isError ? (
          <p className="mt-4 text-sm text-magenta text-center animate-fade-in">
            No pudimos crear la cuenta. Verifica los datos.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary w-full mt-6 py-2.5"
        >
          {mutation.isPending ? 'Creando…' : 'Crear cuenta'}
        </button>

        <p className="mt-6 text-center text-sm text-ink-300">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sun hover:text-cream transition-colors">
            Entra aquí
          </Link>
        </p>
      </form>
    </main>
  );
};

const Backdrop = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        'radial-gradient(ellipse at 30% 20%, rgba(127,223,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(255,184,107,0.10) 0%, transparent 55%)',
    }}
  />
);
