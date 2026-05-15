import { useNavigate, useParams } from 'react-router-dom';

import { PhaserGame } from '../../engine/PhaserGame';
import { ChatPanel } from '../chat/chat.panel';

import { useWorldRoom } from './use-world-room';

export const RoomScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const safeRoomId = roomId ?? '';
  const { status, error } = useWorldRoom(safeRoomId);

  const statusLabel =
    status === 'connecting'
      ? 'Connecting…'
      : status === 'connected'
        ? 'Connected'
        : `Error: ${error ?? 'unknown'}`;
  const statusColor =
    status === 'connected'
      ? 'bg-emerald-600'
      : status === 'connecting'
        ? 'bg-amber-600'
        : 'bg-rose-600';

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <PhaserGame />
      </div>

      <span
        className={`pointer-events-none absolute left-4 top-4 rounded-md px-3 py-1 text-xs font-semibold text-white ${statusColor}`}
      >
        {statusLabel}
      </span>

      <button
        type="button"
        onClick={() => navigate('/lobby')}
        className="absolute right-4 top-4 rounded-md bg-slate-900/80 px-3 py-1 text-sm text-slate-100 ring-1 ring-slate-700 hover:bg-slate-800"
      >
        Leave
      </button>

      <ChatPanel />
    </div>
  );
};
