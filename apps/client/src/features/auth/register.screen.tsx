import { Button } from '@pixelgame/shared-ui';
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
    <main className="flex h-full items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-slate-900/80 p-8 shadow-xl ring-1 ring-slate-800"
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-100">Create an account</h1>
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
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            minLength={3}
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
          />
        </div>
        {mutation.isError ? (
          <p className="mb-4 text-sm text-rose-400">Registration failed. Please try again.</p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
};
