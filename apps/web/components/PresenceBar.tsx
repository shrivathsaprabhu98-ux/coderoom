"use client";

import type { PresenceUser } from "@/hooks/usePresence";

type Props = {
  users: PresenceUser[];
  onEditMe: () => void;
};

export default function PresenceBar({ users, onEditMe }: Props) {
  return (
    <div className="flex items-center -space-x-2">
      {users.map((user) => (
        <button
          key={user.clientId}
          type="button"
          title={user.isMe ? `${user.name} (you) – click to change your name` : user.name}
          onClick={user.isMe ? onEditMe : undefined}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-950 text-xs font-bold text-white ${
            user.isMe ? "cursor-pointer ring-2 ring-white/60" : "cursor-default"
          }`}
          style={{ backgroundColor: user.color }}
        >
          {user.name.charAt(0).toUpperCase()}
        </button>
      ))}
    </div>
  );
}