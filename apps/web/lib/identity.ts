const NAME_KEY = "coderoom:name";
const COLOR_KEY = "coderoom:color";

export const USER_COLORS = [
  "#e11d48", "#ea580c", "#ca8a04", "#16a34a",
  "#0891b2", "#2563eb", "#7c3aed", "#db2777",
];

const listeners = new Set<() => void>();

export function subscribeIdentity(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readName() {
  return localStorage.getItem(NAME_KEY);
}

export function readColor() {
  return localStorage.getItem(COLOR_KEY);
}

// Keep only letters, numbers, spaces and . _ - (max 20 characters)
export function cleanName(raw: string) {
  return raw
    .replace(/[^\p{L}\p{N} ._-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

// A colour must look like #1a2b3c
export function isSafeColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function saveName(raw: string) {
  const name = cleanName(raw);
  if (!name) return;
  localStorage.setItem(NAME_KEY, name);
  if (!isSafeColor(readColor())) {
    const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    localStorage.setItem(COLOR_KEY, color);
  }
  listeners.forEach((listener) => listener());
}