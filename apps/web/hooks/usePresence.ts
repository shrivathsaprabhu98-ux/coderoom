"use client";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cleanName, isSafeColor } from "@/lib/identity";

type Awareness = NonNullable<HocuspocusProvider["awareness"]>;

export type PresenceUser = {
  clientId: number;
  name: string;
  color: string;
  isMe: boolean;
};

// Build the list of people as text, so React only updates when names or colours change
function readUsers(awareness: Awareness | null): string {
  if (!awareness) return "[]";
  const users: PresenceUser[] = [];
  awareness.getStates().forEach((state, clientId) => {
    const user = state.user as { name?: unknown; color?: unknown } | undefined;
    if (!user || typeof user.name !== "string") return;
    users.push({
      clientId,
      name: cleanName(user.name) || "Guest",
      color: isSafeColor(user.color) ? user.color : "#71717a",
      isMe: clientId === awareness.clientID,
    });
  });
  users.sort((a, b) => a.clientId - b.clientId);
  return JSON.stringify(users);
}

export function usePresence(awareness: Awareness | null) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!awareness) return () => {};
      awareness.on("change", onChange);
      return () => awareness.off("change", onChange);
    },
    [awareness]
  );

  const json = useSyncExternalStore(subscribe, () => readUsers(awareness), () => "[]");
  return useMemo(() => JSON.parse(json) as PresenceUser[], [json]);
}