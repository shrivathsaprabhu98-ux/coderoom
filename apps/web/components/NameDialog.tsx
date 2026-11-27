"use client";

import { useState, type FormEvent } from "react";
import { saveName } from "@/lib/identity";

type Props = {
  initialName?: string;
  onDone?: () => void;
};

export default function NameDialog({ initialName = "", onDone }: Props) {
  const [value, setValue] = useState(initialName);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveName(value);
    onDone?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-zinc-900 p-6 text-zinc-100 shadow-xl"
      >
        <div>
          <h2 className="text-lg font-semibold">What should we call you?</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Others in the room will see this name next to your cursor.
          </p>
        </div>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          placeholder="Your name"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500 disabled:opacity-50"
        >
          Join room
        </button>
      </form>
    </div>
  );
}