import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PhaserGame } from '../../engine/PhaserGame';
import { useRoomStore } from '../../state/room.store';
import { ChatPanel } from '../chat/chat.panel';
import { DecoratePanel } from '../decorate/decorate.panel';

import { useWorldRoom } from './use-world-room';

export const RoomScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const safeRoomId = roomId ?? '';
  const { status, error } = useWorldRoom(safeRoomId);
  const playerCount = useRoomStore((s) => Object.keys(s.players).length);
  const editMode = useRoomStore((s) => s.editMode);
  const setEditMode = useRoomStore((s) => s.setEditMode);

  // ESC exits edit mode.
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setEditMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editMode, setEditMode]);

  const statusDotColor =
    status === 'connected' ? 'bg-moss' : status === 'connecting' ? 'bg-sun' : 'bg-magenta';
  const statusLabel =
    status === 'connected'
      ? 'En línea'
      : status === 'connecting'
        ? 'Conectando…'
        : `Error · ${error ?? 'desconocido'}`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <PhaserGame />
      </div>

      {/* Edit-mode visual ring */}
      {editMode ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-cyan/40 animate-fade-in"
        />
      ) : null}

      {/* Top-left: room identity */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 animate-fade-in">
        <div className="chip glass">
          <span className={`chip-dot ${statusDotColor} animate-pulse-soft`} />
          <span className="text-ink-50">{statusLabel}</span>
        </div>
        <div className="chip glass">
          <svg className="w-3 h-3 text-ink-300" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-ink-50">{playerCount}</span>
        </div>
        {editMode ? (
          <div className="chip glass">
            <span className="chip-dot bg-cyan animate-pulse-soft" />
            <span className="text-ink-50">Modo decorar</span>
          </div>
        ) : null}
      </div>

      {/* Top-right: leave */}
      <div className="absolute right-4 top-4 animate-fade-in">
        <button type="button" onClick={() => navigate('/lobby')} className="btn-ghost">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.22-.53l-3.25-3.25a.75.75 0 10-1.06 1.06l1.97 1.97H8.75a.75.75 0 000 1.5h7.69l-1.97 1.97a.75.75 0 101.06 1.06l3.25-3.25A.75.75 0 0019 10z"
              clipRule="evenodd"
            />
          </svg>
          Salir
        </button>
      </div>

      {/* Bottom-left: action shelf */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 animate-fade-in">
        <ActionPill icon="🎒" label="Inventario" disabled />
        <ActionPill
          icon="🛠"
          label={editMode ? 'Cerrar' : 'Decorar'}
          active={editMode}
          onClick={() => setEditMode(!editMode)}
        />
        <ActionPill icon="⚙" label="Ajustes" disabled />
      </div>

      <DecoratePanel />
      <ChatPanel />
    </div>
  );
};

interface ActionPillProps {
  icon: string;
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const ActionPill = ({ icon, label, disabled, active, onClick }: ActionPillProps): JSX.Element => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`chip glass disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
      active ? 'ring-1 ring-cyan/60 bg-cyan/10' : 'hover:bg-white/5'
    }`}
    title={disabled ? 'Próximamente' : label}
  >
    <span aria-hidden="true">{icon}</span>
    <span className={active ? 'text-cyan' : 'text-ink-50'}>{label}</span>
  </button>
);
