import { Button } from '@pixelgame/shared-ui';
import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../auth/use-auth';

import { useRoomsQuery } from './use-rooms';

export const LobbyScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const rooms = useRoomsQuery();
  const logout = useLogoutMutation();

  return (
    <main className="mx-auto flex h-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Pick a room</h1>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="text-sm text-slate-400 hover:text-slate-200"
          disabled={logout.isPending}
        >
          Logout
        </button>
      </header>

      {rooms.isLoading ? (
        <p className="text-slate-400">Loading rooms…</p>
      ) : rooms.isError ? (
        <p className="text-rose-400">Failed to load rooms.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(rooms.data ?? []).map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between rounded-md bg-slate-900/70 px-4 py-3 ring-1 ring-slate-800"
            >
              <div>
                <p className="font-medium text-slate-100">{room.name}</p>
                <p className="text-xs text-slate-400">
                  {room.occupants} / {room.capacity} players
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate(`/room/${room.id}`)}>
                Enter
              </Button>
            </li>
          ))}
          {rooms.data && rooms.data.length === 0 ? (
            <li className="rounded-md bg-slate-900/70 px-4 py-6 text-center text-slate-400 ring-1 ring-slate-800">
              No rooms available yet.
            </li>
          ) : null}
        </ul>
      )}
    </main>
  );
};
