"use client";

import type { PresenceUser } from "@/hooks/usePresence";

// y-monaco gives each person's cursor a class like "yRemoteSelectionHead-123".
// Here we write a colour (and name tag) for each of those classes.
export default function RemoteCursorStyles({ users }: { users: PresenceUser[] }) {
  const css = users
    .filter((user) => !user.isMe)
    .map(
      (user) => `
.yRemoteSelection-${user.clientId} { background-color: ${user.color}40; }
.yRemoteSelectionHead-${user.clientId} { border-left-color: ${user.color}; }
.yRemoteSelectionHead-${user.clientId}::after { content: "${user.name}"; background-color: ${user.color}; }`
    )
    .join("\n");

  return <style>{css}</style>;
}