import { useNavigate } from 'react-router-dom';

import { useSessionStore } from '../../state/session.store';
import { useLogoutMutation } from '../auth/use-auth';

import { useRoomsQuery } from './use-rooms';

export const LobbyScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const rooms = useRoomsQuery();
  const logout = useLogoutMutation();
  const user = useSessionStore((s) => s.user);

  return (
    <main className="relative min-h-full overflow-hidden">
      <AmbientBackdrop />

      <div className="relative mx-auto flex h-full max-w-3xl flex-col gap-8 px-6 py-12 animate-fade-in">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-300">
              Hola, {user?.username ?? 'visitante'}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold text-ink-50">
              Elige un espacio
            </h1>
            <p className="mt-2 max-w-md text-sm text-ink-100/70">
              Salas vivas, conexiones reales. Entra y siente la atmósfera.
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="btn-ghost"
          >
            Cerrar sesión
          </button>
        </header>

        {rooms.isLoading ? (
          <div className="glass rounded-2xl p-8 text-center text-ink-300">Cargando salas…</div>
        ) : rooms.isError ? (
          <div className="glass rounded-2xl p-8 text-center text-magenta">
            No se pudieron cargar las salas. Verifica que el API esté en línea.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {(rooms.data ?? []).map((room, idx) => (
              <li
                key={room.id}
                className="glass rounded-2xl p-5 flex items-center justify-between animate-slide-up hover:bg-white/[0.02] transition-colors"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <RoomGlyph seed={room.id} />
                  <div>
                    <p className="font-display text-lg font-semibold text-ink-50">{room.name}</p>
                    <p className="text-xs text-ink-300 mt-0.5">
                      {room.occupants} / {room.capacity} personas · público
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(`/room/${room.id}`)}
                >
                  Entrar
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
            {rooms.data && rooms.data.length === 0 ? (
              <li className="glass rounded-2xl p-8 text-center text-ink-300">
                Aún no hay salas. Pídele al admin que cree una.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </main>
  );
};

const RoomGlyph = ({ seed }: { seed: string }): JSX.Element => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const hue = ((h % 360) + 360) % 360;
  return (
    <div
      className="relative w-12 h-12 rounded-xl flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 35% / 0.4), hsl(${(hue + 60) % 360} 55% 25% / 0.4))`,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        className="text-xl"
        style={{ filter: `hue-rotate(${hue}deg) saturate(0.8)` }}
        aria-hidden="true"
      >
        ✦
      </span>
    </div>
  );
};

const AmbientBackdrop = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        'radial-gradient(ellipse at 80% 10%, rgba(255,184,107,0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 90%, rgba(127,223,255,0.08) 0%, transparent 50%)',
    }}
  />
);
