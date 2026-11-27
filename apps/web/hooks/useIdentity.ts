"use client";

import { useSyncExternalStore } from "react";
import { readColor, readName, subscribeIdentity } from "@/lib/identity";

export function useIdentity() {
  const name = useSyncExternalStore(subscribeIdentity, readName, () => null);
  const color = useSyncExternalStore(subscribeIdentity, readColor, () => null);
  return { name, color };
}