import "./env.js";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { loadRoom, saveRoom, setupDatabase } from "./db.js";
import { runInSandbox } from "./runner.js";

const API_PORT = Number(process.env.API_PORT ?? 4000);
const SYNC_PORT = Number(process.env.SYNC_PORT ?? 1234);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

// ---------- Database ----------
await setupDatabase();
console.log("Database ready");

// ---------- Door 1: API server (normal requests) ----------
const app = express();
app.use(cors({ origin: WEB_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// What a valid "run" request must look like
const runSchema = z.object({
  language: z.enum(["python", "javascript", "java", "cpp", "c"]),
  code: z.string().min(1, "Your code is empty.").max(64_000, "Code is too long (max 64 KB)."),
  stdin: z.string().max(10_000, "Input is too long (max 10 KB).").default(""),
});

// Max 5 runs every 10 seconds per person
const runLimiter = rateLimit({
  windowMs: 10_000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many runs. Please wait a few seconds and try again." },
});

app.post("/run", runLimiter, async (req, res) => {
  const parsed = runSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request." });
    return;
  }

  const { language, code, stdin } = parsed.data;
  try {
    const result = await runInSandbox(language, code, stdin);
    res.json(result);
  } catch (error) {
    console.error("Run failed:", error);
    res.status(502).json({ error: "The code runner isn't available right now. Please try again." });
  }
});

app.listen(API_PORT, () => {
  console.log(`API server running at http://localhost:${API_PORT}`);
});

// ---------- Door 2: Live sync server (live typing) ----------
const syncServer = new Server({
  name: "coderoom-sync",
  port: SYNC_PORT,
  quiet: true,

  extensions: [
    new Database({
      // First person opens a room: load its saved code
      fetch: async ({ documentName }) => loadRoom(documentName),

      // After changes (with a short pause): save the latest code
      store: async ({ documentName, state }) => {
        await saveRoom(documentName, state);
        console.log(`Saved room: ${documentName}`);
      },
    }),
  ],

  async onConnect({ documentName }) {
    console.log(`Someone joined room: ${documentName}`);
  },

  async onDisconnect({ documentName }) {
    console.log(`Someone left room: ${documentName}`);
  },
});

syncServer.listen();
console.log(`Live sync server running at ws://localhost:${SYNC_PORT}`);