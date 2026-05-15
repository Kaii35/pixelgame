import { Button } from '@pixelgame/shared-ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { useRoomStore } from '../../state/room.store';

const VISIBLE = 20;

export const ChatPanel = (): JSX.Element => {
  const chatHistory = useRoomStore((s) => s.chatHistory);
  const sendChat = useRoomStore((s) => s.sendChat);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

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
    <section className="pointer-events-auto absolute bottom-4 right-4 flex h-[280px] w-[360px] flex-col rounded-md bg-slate-950/80 ring-1 ring-slate-800 backdrop-blur">
      <header className="border-b border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
        Chat
      </header>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {visible.length === 0 ? (
          <p className="text-xs text-slate-500">No messages yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {visible.map((msg) => (
              <li key={msg.id} className="text-sm text-slate-200">
                <span className="font-semibold text-indigo-300">{msg.authorName}</span>{' '}
                <span className="text-slate-200">{msg.body}</span>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-800 p-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Say something…"
          maxLength={280}
          className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
        <Button type="submit" variant="primary" size="sm" disabled={disabled}>
          Send
        </Button>
      </form>
    </section>
  );
};
