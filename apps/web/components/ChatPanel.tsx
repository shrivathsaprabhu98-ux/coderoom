"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type * as Y from "yjs";
import { useChatMessages } from "@/hooks/useChatMessages";
import {
  MAX_MESSAGE_LENGTH,
  safeMessage,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat";

type Props = {
  ydoc: Y.Doc;
  chat: Y.Array<ChatMessage>;
  me: { clientId: number; name: string; color: string } | null;
  dark: boolean;
};

function formatTime(time: number) {
  return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({ ydoc, chat, me, dark }: Props) {
  const messages = useChatMessages(chat);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!clean || !me) return;
    sendChatMessage(ydoc, chat, {
      id: crypto.randomUUID(),
      authorId: me.clientId,
      name: me.name,
      color: me.color,
      text: clean,
      time: Date.now(),
    });
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">No messages yet. Say hi 👋</p>
        )}

        {messages.map((raw) => {
          const message = safeMessage(raw);
          if (!message) return null;
          const mine = me?.clientId === message.authorId;
          return (
            <div key={message.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold" style={{ color: message.color }}>
                  {message.name}
                  {mine ? " (you)" : ""}
                </span>
                <span className="text-xs text-zinc-500">{formatTime(message.time)}</span>
              </div>
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className={`flex gap-2 border-t p-2 ${dark ? "border-zinc-800" : "border-zinc-200"}`}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={me ? "Type a message…" : "Set your name to chat"}
          disabled={!me}
          className={`min-w-0 flex-1 rounded border px-2 py-1.5 text-sm outline-none focus:border-blue-500 ${
            dark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white"
          }`}
        />
        <button
          type="submit"
          disabled={!me || !text.trim()}
          className="rounded bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}