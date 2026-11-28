"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import type { RunState } from "@/lib/run";

type Props = {
  dark: boolean;
  stdin: string;
  onStdinChange: (value: string) => void;
  run: RunState | null;
  onClear: () => void;
};

// Run results come from other people's browsers too, so only accept the right types
const text = (value: unknown) => (typeof value === "string" ? value : "");
const num = (value: unknown) => (typeof value === "number" ? value : null);

function formatMemory(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function languageLabel(id: LanguageId) {
  return LANGUAGES[id]?.label ?? "Code";
}

function RunOutput({ run }: { run: RunState | null }) {
  if (!run) {
    return <span className="text-zinc-500">Press Run to see your program&apos;s output here.</span>;
  }

  const label = languageLabel(run.language);
  const by = text(run.by) || "Someone";

  if (run.status === "running") {
    return (
      <span className="text-zinc-400">
        ⏳ Running {label} code… (started by {by})
      </span>
    );
  }

  if (run.status === "error") {
    return (
      <>
        <div className="mb-2 text-xs text-zinc-500">
          Run by {by} · {label}
        </div>
        <span className="text-red-400">{text(run.error) || "Something went wrong."}</span>
      </>
    );
  }

  const stdout = text(run.stdout);
  const stderr = text(run.stderr);
  const compileOutput = text(run.compileOutput);
  const message = text(run.message);
  const exitCode = num(run.exitCode);
  const timeMs = num(run.timeMs);
  const memoryKb = num(run.memoryKb);
  const killed = run.signal === "SIGKILL";

  const details = [
    `Run by ${by}`,
    label,
    exitCode !== null ? `exit code ${exitCode}` : null,
    timeMs !== null ? `${timeMs} ms` : null,
    memoryKb !== null ? formatMemory(memoryKb) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="mb-2 text-xs text-zinc-500">{details}</div>

      {compileOutput && (
        <div className="text-red-400">
          <div className="font-semibold">Compilation failed:</div>
          {compileOutput}
        </div>
      )}

      {stdout && <div>{stdout}</div>}
      {stderr && <div className="text-red-400">{stderr}</div>}

      {killed && (
        <div className="mt-2 text-yellow-500">
          Stopped: the program took too long or used too much memory.
          {message ? ` (${message})` : ""}
        </div>
      )}
      {!killed && message && <div className="mt-2 text-yellow-500">{message}</div>}

      {!stdout && !stderr && !compileOutput && !killed && (
        <span className="text-zinc-500">(no output)</span>
      )}
    </>
  );
}

export default function OutputPanel({ dark, stdin, onStdinChange, run, onClear }: Props) {
  const border = dark ? "border-zinc-800" : "border-zinc-200";

  return (
    <Group orientation="vertical" className="h-full">
      {/* Top: Output */}
      <Panel defaultSize="65%" minSize="20%">
        <div className="flex h-full flex-col">
          <div className={`flex items-center justify-between border-b px-3 py-2 ${border}`}>
            <h2 className="text-sm font-semibold">Output</h2>
            <button onClick={onClear} className="text-xs text-zinc-500 hover:underline">
              Clear
            </button>
          </div>
          <div
            className={`flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm ${
              dark ? "bg-black/40 text-zinc-200" : "bg-zinc-50 text-zinc-800"
            }`}
          >
            <RunOutput run={run} />
          </div>
        </div>
      </Panel>

      {/* Drag line between Output and Input */}
      <Separator
        className={`h-1 transition-colors ${
          dark ? "bg-zinc-800 hover:bg-blue-600" : "bg-zinc-200 hover:bg-blue-500"
        }`}
      />

      {/* Bottom: Input (stdin) */}
      <Panel defaultSize="35%" minSize="15%">
        <div className="flex h-full flex-col">
          <div className={`border-b px-3 py-2 ${border}`}>
            <h2 className="text-sm font-semibold">Input (stdin)</h2>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Type the input your program reads, one value per line"
            spellCheck={false}
            className={`flex-1 resize-none p-3 font-mono text-sm outline-none ${
              dark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"
            }`}
          />
        </div>
      </Panel>
    </Group>
  );
}