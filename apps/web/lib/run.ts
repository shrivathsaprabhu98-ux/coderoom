import type { LanguageId } from "@/lib/languages";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// What the server sends back after running code
export type RunResult = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number | null;
  signal: string | null;
  timeMs: number | null;
  memoryKb: number | null;
  message: string | null;
};

// The latest run, shared with everyone in the room
export type RunState =
  | { status: "running"; by: string; language: LanguageId; startedAt: number }
  | ({ status: "done"; by: string; language: LanguageId; finishedAt: number } & RunResult)
  | { status: "error"; by: string; language: LanguageId; finishedAt: number; error: string };

export async function executeCode(input: {
  language: LanguageId;
  code: string;
  stdin: string;
}): Promise<RunResult> {
  const response = await fetch(`${API_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (${response.status})`);
  }
  return data as RunResult;
}