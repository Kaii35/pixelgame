import { Button } from '@pixelgame/shared-ui';
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
    <main className="flex h-full items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-slate-900/80 p-8 shadow-xl ring-1 ring-slate-800"
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-100">Welcome back</h1>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
          />
        </div>
        {mutation.isError ? (
          <p className="mb-4 text-sm text-rose-400">Login failed. Please try again.</p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
};
