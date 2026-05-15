import { useEffect, useRef, useState, type FormEvent } from 'react';

import { useRoomStore } from '../../state/room.store';

const VISIBLE = 20;

const colorFromId = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return `hsl(${((h % 360) + 360) % 360}, 65%, 72%)`;
};

export const ChatPanel = (): JSX.Element => {
  const chatHistory = useRoomStore((s) => s.chatHistory);
  const sendChat = useRoomStore((s) => s.sendChat);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !sendChat) return;
    sendChat(trimmed);
    setBody('');
  };

  const visible = chatHistory.slice(-VISIBLE);
  const disabled = sendChat === null || body.trim().length === 0;

  return (
    <section
      className={`pointer-events-auto absolute bottom-4 right-4 flex w-[360px] flex-col rounded-2xl glass shadow-glass animate-slide-up transition-[height] duration-300 ${
        collapsed ? 'h-[48px]' : 'h-[320px]'
      }`}
    >
      <header className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="chip-dot bg-moss animate-pulse-soft" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-100">
            Sala
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-xs text-ink-300 hover:text-ink-50 transition-colors"
          aria-label={collapsed ? 'Expandir chat' : 'Colapsar chat'}
        >
          {collapsed ? '▴' : '▾'}
        </button>
      </header>

      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-1">
            {visible.length === 0 ? (
              <p className="mt-2 text-xs text-ink-300/70 italic">
                Aún no hay mensajes. Saluda al lugar.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 py-1">
                {visible.map((msg) => (
                  <li key={msg.id} className="text-sm leading-snug">
                    <span
                      className="mr-1.5 font-semibold"
                      style={{ color: colorFromId(msg.authorId) }}
                    >
                      {msg.authorName}
                    </span>
                    <span className="text-ink-50/90">{msg.body}</span>
                  </li>
                ))}
              </ul>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/5 p-2.5">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={sendChat ? 'Escribe algo…' : 'Conectando…'}
              maxLength={280}
              disabled={!sendChat}
              className="field flex-1 disabled:opacity-50"
            />
            <button type="submit" disabled={disabled} className="btn-primary disabled:opacity-50">
              Enviar
            </button>
          </form>
        </>
      )}
    </section>
  );
};
