"use client";

import Link from "next/link";
import { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeEditor from "@/components/CodeEditor";
import OutputPanel from "@/components/OutputPanel";
import { LANGUAGES, type LanguageId } from "@/lib/languages";

type Theme = "vs-dark" | "light";

export default function RoomView({ roomId }: { roomId: string }) {
  const [language, setLanguage] = useState<LanguageId>("python");
  const [code, setCode] = useState<string>(LANGUAGES.python.starter);
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [copied, setCopied] = useState(false);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");

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

  function runCode() {
    // Placeholder until Week 4, when this sends the code to the Judge0 sandbox
    const codeLines = code.split("\n").length;
    const inputInfo = stdin ? `, ${stdin.split("\n").length} line(s) of input` : "";
    setOutput(
      `▶ Run pressed: ${LANGUAGES[language].label}, ${codeLines} lines of code${inputInfo}\n\n` +
        "Running code arrives in Week 4, when we connect the Judge0 sandbox."
    );
  }

  return (
    <div
      className={`flex h-screen flex-col ${
        dark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"
      }`}
    >
      {/* Top bar */}
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
          <button
            onClick={runCode}
            className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-500"
          >
            ▶ Run
          </button>

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

      {/* Editor on the left, Output + Input on the right */}
      <main className="min-h-0 flex-1">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize="70%" minSize="30%">
            <CodeEditor
              language={LANGUAGES[language].monaco}
              value={code}
              onChange={setCode}
              theme={theme}
            />
          </Panel>

          <Separator
            className={`w-1 transition-colors ${
              dark ? "bg-zinc-800 hover:bg-blue-600" : "bg-zinc-200 hover:bg-blue-500"
            }`}
          />

          <Panel defaultSize="30%" minSize="20%">
            <OutputPanel
              dark={dark}
              stdin={stdin}
              onStdinChange={setStdin}
              output={output}
              onClear={() => setOutput("")}
            />
          </Panel>
        </Group>
      </main>
    </div>
  );
}