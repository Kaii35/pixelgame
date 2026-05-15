import { catalog } from '@pixelgame/game-core';

import { useRoomStore } from '../../state/room.store';

/**
 * Decoration shelf — visible only when editMode is on. Renders the catalog
 * as selectable chips. The currently selected kind is highlighted. Clicking
 * an empty tile in editMode places the selected kind; clicking an occupied
 * tile removes the piece (no selection needed).
 */
export const DecoratePanel = (): JSX.Element | null => {
  const editMode = useRoomStore((s) => s.editMode);
  const selectedKind = useRoomStore((s) => s.selectedKind);
  const setSelectedKind = useRoomStore((s) => s.setSelectedKind);
  const setEditMode = useRoomStore((s) => s.setEditMode);

  if (!editMode) return null;

  return (
    <section className="pointer-events-auto absolute left-1/2 bottom-4 -translate-x-1/2 animate-slide-up">
      <div className="glass-strong rounded-2xl px-3 py-2 flex items-center gap-2">
        <div className="flex items-center gap-1 px-2">
          <span className="chip-dot bg-cyan animate-pulse-soft" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-100">
            Decorar
          </span>
        </div>
        <span className="h-6 w-px bg-white/10" aria-hidden="true" />
        <ul className="flex items-center gap-1.5">
          {catalog.CATALOG.map((item) => {
            const active = item.kind === selectedKind;
            return (
              <li key={item.kind}>
                <button
                  type="button"
                  onClick={() => setSelectedKind(active ? null : item.kind)}
                  className={`group flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                    active
                      ? 'bg-sun/15 ring-1 ring-sun/60'
                      : 'hover:bg-white/5 ring-1 ring-transparent'
                  }`}
                  title={item.name}
                >
                  <span
                    className={`text-base leading-none ${active ? 'text-sun' : 'text-ink-100'}`}
                    aria-hidden="true"
                  >
                    {item.glyph}
                  </span>
                  <span
                    className={`text-[10px] ${active ? 'text-sun' : 'text-ink-300 group-hover:text-ink-100'}`}
                  >
                    {item.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <span className="h-6 w-px bg-white/10" aria-hidden="true" />
        <p className="px-2 text-[10px] text-ink-300/80 max-w-[170px] leading-tight">
          {selectedKind
            ? 'Click en un tile vacío para colocar. Click en un mueble para quitarlo.'
            : 'Selecciona una pieza, o click en un mueble existente para quitarlo.'}
        </p>
        <button
          type="button"
          onClick={() => setEditMode(false)}
          className="btn-ghost text-[11px]"
          title="Salir de decoración (Esc)"
        >
          Listo
        </button>
      </div>
    </section>
  );
};
