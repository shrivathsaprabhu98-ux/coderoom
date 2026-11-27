"use client";

import { Group, Panel, Separator } from "react-resizable-panels";

type Props = {
  dark: boolean;
  stdin: string;
  onStdinChange: (value: string) => void;
  output: string;
  onClear: () => void;
};

export default function OutputPanel({ dark, stdin, onStdinChange, output, onClear }: Props) {
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
          <pre
            className={`flex-1 overflow-auto whitespace-pre-wrap p-3 font-mono text-sm ${
              dark ? "bg-black/40 text-zinc-200" : "bg-zinc-50 text-zinc-800"
            }`}
          >
            {output || (
              <span className="text-zinc-500">Press Run to see your program&apos;s output here.</span>
            )}
          </pre>
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