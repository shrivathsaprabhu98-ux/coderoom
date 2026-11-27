import "./env.js";
import cors from "cors";
import express from "express";
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { loadRoom, saveRoom, setupDatabase } from "./db.js";

const API_PORT = Number(process.env.API_PORT ?? 4000);
const SYNC_PORT = Number(process.env.SYNC_PORT ?? 1234);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

// ---------- Database ----------
await setupDatabase();
console.log("Database ready");

// ---------- Door 1: API server (normal requests) ----------
const app = express();
app.use(cors({ origin: WEB_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
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