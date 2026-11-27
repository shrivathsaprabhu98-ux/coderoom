"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useState } from "react";
import * as Y from "yjs";

const SYNC_URL = process.env.NEXT_PUBLIC_SYNC_URL ?? "ws://localhost:1234";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export type RoomSync = {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  ytext: Y.Text;
  meta: Y.Map<string>;
};

export function useRoomSync(roomId: string) {
  const [sync, setSync] = useState<RoomSync | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: SYNC_URL,
      name: roomId,
      document: ydoc,
      onStatus: ({ status }) => setStatus(status as ConnectionStatus),
      onSynced: () => setSynced(true),
    });
    // Store the new connection so the page can use it (intentional: syncing with an external system)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSync({
      ydoc,
      provider,
      ytext: ydoc.getText("code"),
      meta: ydoc.getMap<string>("meta"),
    });

    return () => {
      provider.destroy();
      ydoc.destroy();
      setSync(null);
      setSynced(false);
    };
  }, [roomId]);

  return { sync, status, synced };
}