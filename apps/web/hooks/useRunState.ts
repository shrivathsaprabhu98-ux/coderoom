"use client";

import { useCallback, useSyncExternalStore } from "react";
import type * as Y from "yjs";
import type { RunState } from "@/lib/run";

export function useRunState(run: Y.Map<RunState> | null) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!run) return () => {};
      run.observe(onChange);
      return () => run.unobserve(onChange);
    },
    [run]
  );

  return useSyncExternalStore(subscribe, () => run?.get("last") ?? null, () => null);
}