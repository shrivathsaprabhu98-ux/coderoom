import type * as Y from "yjs";
import { cleanName, isSafeColor } from "@/lib/identity";

export type ChatMessage = {
  id: string;
  authorId: number;
  name: string;
  color: string;
  text: string;
  time: number;
};

export const MAX_MESSAGES = 200;
export const MAX_MESSAGE_LENGTH = 500;

// Add a message, and drop the oldest ones if there are more than 200
export function sendChatMessage(ydoc: Y.Doc, chat: Y.Array<ChatMessage>, message: ChatMessage) {
  ydoc.transact(() => {
    chat.push([message]);
    const extra = chat.length - MAX_MESSAGES;
    if (extra > 0) chat.delete(0, extra);
  });
}

// Messages come from other people's browsers: check every field before showing it
export function safeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Partial<ChatMessage>;
  if (typeof m.id !== "string" || typeof m.text !== "string" || typeof m.time !== "number") {
    return null;
  }
  return {
    id: m.id,
    authorId: typeof m.authorId === "number" ? m.authorId : -1,
    name: typeof m.name === "string" ? cleanName(m.name) || "Guest" : "Guest",
    color: isSafeColor(m.color) ? m.color : "#71717a",
    text: m.text.slice(0, MAX_MESSAGE_LENGTH),
    time: m.time,
  };
}