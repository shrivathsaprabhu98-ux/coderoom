"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function makeRoomId(length = 8) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  function createRoom() {
    router.push(`/room/${makeRoomId()}`);
  }

  function joinRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = roomId.trim();
    if (id) router.push(`/room/${id}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold">CodeRoom</h1>
          <p className="mt-2 text-zinc-400">Write, run and discuss code together, live.</p>
        </div>

        <button
          onClick={createRoom}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
        >
          Create a new room
        </button>

        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <div className="h-px flex-1 bg-zinc-800" />
          or join one
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form onSubmit={joinRoom} className="flex gap-2">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room code"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-blue-500"
          />
          <button type="submit" className="rounded-lg border border-zinc-700 px-4 py-2 hover:bg-zinc-800">
            Join
          </button>
        </form>
      </div>
    </main>
  );
}