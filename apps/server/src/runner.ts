const PISTON_URL = process.env.PISTON_URL ?? "http://localhost:2000";
const MAX_OUTPUT = 20_000; // characters

// CodeRoom language → Piston language name and file name
export const RUNNABLE = {
  python: { language: "python", file: "main.py" },
  javascript: { language: "javascript", file: "main.js" },
  java: { language: "java", file: "Main.java" },
  cpp: { language: "c++", file: "main.cpp" },
  c: { language: "c", file: "main.c" },
} as const;

export type RunnableLanguage = keyof typeof RUNNABLE;

// What our server sends back to the browser
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

// What Piston sends back to us
type PistonStage = {
  stdout?: string;
  stderr?: string;
  output?: string;
  code?: number | null;
  signal?: string | null;
  message?: string | null;
  cpu_time?: number | null;
  wall_time?: number | null;
  memory?: number | null;
};
type PistonResponse = { run?: PistonStage; compile?: PistonStage; message?: string };

// Very long output is cut so it can't overload the page
function cut(text: string | undefined) {
  const value = text ?? "";
  return value.length > MAX_OUTPUT
    ? value.slice(0, MAX_OUTPUT) + "\n… output cut off (too long)"
    : value;
}

export async function runInSandbox(
  language: RunnableLanguage,
  code: string,
  stdin: string
): Promise<RunResult> {
  const { language: pistonLanguage, file } = RUNNABLE[language];

  const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: pistonLanguage,
      version: "*",
      files: [{ name: file, content: code }],
      stdin,
      compile_timeout: 10_000, // max 10 seconds to compile
      run_timeout: 3_000, // max 3 seconds to run
      run_memory_limit: 256 * 1024 * 1024, // max 256 MB of memory
    }),
    signal: AbortSignal.timeout(20_000), // give up if Piston doesn't answer in 20 s
  });

  const data = (await response.json()) as PistonResponse;
  if (!response.ok) {
    throw new Error(data.message ?? `Sandbox error (${response.status})`);
  }

  // For Java, C and C++: if compiling failed, the program never ran
  const compile = data.compile;
  const compileFailed = !!compile && compile.code !== 0;
  const run = compileFailed ? undefined : data.run;

  return {
    stdout: cut(run?.stdout),
    stderr: cut(run?.stderr),
    compileOutput: compileFailed ? cut(compile?.output) : "",
    exitCode: compileFailed ? (compile?.code ?? null) : (run?.code ?? null),
    signal: run?.signal ?? compile?.signal ?? null,
    timeMs: run?.cpu_time ?? run?.wall_time ?? null,
    memoryKb: typeof run?.memory === "number" ? Math.round(run.memory / 1024) : null,
    message: run?.message ?? compile?.message ?? null,
  };
}