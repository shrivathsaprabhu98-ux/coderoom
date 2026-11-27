"use client";

import Editor from "@monaco-editor/react";

type Props = {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme: "vs-dark" | "light";
};

export default function CodeEditor({ language, value, onChange, theme }: Props) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={(v) => onChange(v ?? "")}
      loading={<div className="p-4 text-sm text-zinc-400">Loading editor…</div>}
      options={{
        fontSize: 15,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        tabSize: 4,
        wordWrap: "on",
        padding: { top: 12 },
      }}
    />
  );
}