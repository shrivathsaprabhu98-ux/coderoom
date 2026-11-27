import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check the .env file in the coderoom folder.");
}

export const pool = new pg.Pool({ connectionString });

// Create the table the first time the server starts
export async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS code_snapshots (
      room_slug   TEXT PRIMARY KEY,
      yjs_state   BYTEA NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

// Load a room's saved code (or null if the room is new)
export async function loadRoom(roomSlug: string): Promise<Uint8Array | null> {
  const result = await pool.query<{ yjs_state: Buffer }>(
    "SELECT yjs_state FROM code_snapshots WHERE room_slug = $1",
    [roomSlug]
  );
  return result.rows[0]?.yjs_state ?? null;
}

// Save a room's code: insert it, or update it if it already exists
export async function saveRoom(roomSlug: string, state: Uint8Array) {
  await pool.query(
    `INSERT INTO code_snapshots (room_slug, yjs_state, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (room_slug)
     DO UPDATE SET yjs_state = EXCLUDED.yjs_state, updated_at = now()`,
    [roomSlug, Buffer.from(state)]
  );
}