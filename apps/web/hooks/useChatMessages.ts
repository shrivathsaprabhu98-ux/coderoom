"use client";

import { useEffect, useState } from "react";
import type * as Y from "yjs";
import type { ChatMessage } from "@/lib/chat";

export function useChatMessages(chat: Y.Array<ChatMessage>) {
  const [messages, setMessages] = useState(() => chat.toArray());

  useEffect(() => {
    const update = () => setMessages(chat.toArray());
    chat.observe(update);
    return () => chat.unobserve(update);
  }, [chat]);

  return messages;
}
