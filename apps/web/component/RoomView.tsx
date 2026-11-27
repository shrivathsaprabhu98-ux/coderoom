"use client";

import Link from "next/link";
import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import { LANGUAGES, type LanguageId } from "@/lib/languages";

type Theme = "vs-dark" | "light";

export default function RoomView({ roomId }: { roomId: string }) {
  const [language, setLanguage] = useState<LanguageId>("python");
  const [code, setCode] = useState<string>(LANGUAGES.python.starter);
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [copied, setCopied] = useState(false);

  const dark = theme === "vs-dark";

  function changeLanguage(next: LanguageId) {
    // Only swap in the starter code if the user hasn't written anything yet
    if (code === LANGUAGES[language].starter) {
      setCode(LANGUAGES[next].starter);
    }
    setLanguage(next);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={`flex h-screen flex-col ${
        dark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"
      }`}
    >
      <header
        className={`flex items-center gap-3 border-b px-4 py-2 ${
          dark ? "border-zinc-800" : "border-zinc-200"
        }`}
      >
        <Link href="/" className="font-bold">
          CodeRoom
        </Link>
        <span className="rounded bg-zinc-500/15 px-2 py-0.5 font-mono text-sm">{roomId}</span>
        <button onClick={copyLink} className="text-sm text-blue-500 hover:underline">
          {copied ? "Link copied!" : "Copy link"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as LanguageId)}
            className={`rounded border px-2 py-1 text-sm ${
              dark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white"
            }`}
          >
            {(Object.keys(LANGUAGES) as LanguageId[]).map((id) => (
              <option key={id} value={id}>
                {LANGUAGES[id].label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setTheme(dark ? "light" : "vs-dark")}
            className={`rounded border px-2 py-1 text-sm ${
              dark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            {dark ? "Light theme" : "Dark theme"}
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <section className="min-w-0 flex-1">
          <CodeEditor
            language={LANGUAGES[language].monaco}
            value={code}
            onChange={setCode}
            theme={theme}
          />
        </section>

        <aside className={`w-80 border-l p-4 ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
          <h2 className="text-sm font-semibold">Output</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Press Run to see your program&apos;s output here. (Coming in Week 4.)
          </p>
        </aside>
      </main>
    </div>
  );
}