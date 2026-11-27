"use client";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";

// Use the locally installed Monaco (the same copy y-monaco uses)
loader.config({ monaco });

type Props = {
  language: string;
  theme: "vs-dark" | "light";
  ytext: Y.Text;
  awareness: HocuspocusProvider["awareness"];
};

export default function CodeEditor({ language, theme, ytext, awareness }: Props) {
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleMount: OnMount = (editor) => {
    // @monaco-editor/react and y-monaco use different copies of Monaco's *types*,
    // but at runtime it is the same editor, so we tell TypeScript to treat it as one type.
    const monacoEditor = editor as unknown as monaco.editor.IStandaloneCodeEditor;
    const model = monacoEditor.getModel();
    if (!model) return;
    // Connect the editor to the shared code
    bindingRef.current = new MonacoBinding(
      ytext,
      model,
      new Set([monacoEditor]),
      awareness ?? undefined
    );
  };

  // Disconnect when the editor is removed from the page
  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, []);

  return (
    <Editor
      height="100%"
      language={language}
      theme={theme}
      onMount={handleMount}
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