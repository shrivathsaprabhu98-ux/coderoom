"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import OutputPanel from "@/components/OutputPanel";
import { useRoomSync, type ConnectionStatus } from "@/hooks/useRoomSync";
import { LANGUAGES, type LanguageId } from "@/lib/languages";

// The editor only works in the browser, so never render it on the server
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-zinc-500">Loading editor…</p>,
});

type Theme = "vs-dark" | "light";

const STATUS_STYLE: Record<ConnectionStatus, { dot: string; label: string }> = {
  connecting: { dot: "bg-yellow-500", label: "Connecting…" },
  connected: { dot: "bg-green-500", label: "Live" },
  disconnected: { dot: "bg-red-500", label: "Offline" },
};

export default function RoomView({ roomId }: { roomId: string }) {
  const { sync, status, synced } = useRoomSync(roomId);
  const [language, setLanguage] = useState<LanguageId>("python");
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [copied, setCopied] = useState(false);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");

  const dark = theme === "vs-dark";

  // Follow the shared language: when anyone changes it, everyone's dropdown updates
  useEffect(() => {
    if (!sync) return;
    const { meta } = sync;
    const update = () => {
      const shared = meta.get("language");
      if (shared && shared in LANGUAGES) setLanguage(shared as LanguageId);
    };
    update();
    meta.observe(update);
    return () => meta.unobserve(update);
  }, [sync]);

  // First person in an empty room: add the starter code
  useEffect(() => {
    if (!sync || !synced) return;
    const { ydoc, ytext, meta } = sync;
    if (ytext.length === 0 && !meta.get("language")) {
      ydoc.transact(() => {
        meta.set("language", "python");
        ytext.insert(0, LANGUAGES.python.starter);
      });
    }
  }, [sync, synced]);

  function changeLanguage(next: LanguageId) {
    if (!sync) return;
    const { ydoc, ytext, meta } = sync;
    ydoc.transact(() => {
      // Only swap in the starter code if nobody has written anything yet
      if (ytext.toString() === LANGUAGES[language].starter) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, LANGUAGES[next].starter);
      }
      meta.set("language", next);
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function runCode() {
    // Placeholder until Week 4, when this sends the code to the Judge0 sandbox
    const code = sync?.ytext.toString() ?? "";
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
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[status].dot}`} />
          {STATUS_STYLE[status].label}
        </span>

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
            disabled={!sync}
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
            {sync ? (
              <CodeEditor
                key={sync.ydoc.guid}
                language={LANGUAGES[language].monaco}
                theme={theme}
                ytext={sync.ytext}
                awareness={sync.provider.awareness}
              />
            ) : (
              <p className="p-4 text-sm text-zinc-500">Connecting to room…</p>
            )}
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