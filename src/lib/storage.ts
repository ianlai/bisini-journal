import type { Entry } from "./types";

const ENTRIES_KEY = "bisini_entries_v1";
const CATS_KEY = "bisini_categories_v1";

export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]"); }
  catch { return []; }
}
export function saveEntries(entries: Entry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadCategories(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CATS_KEY) || "[]"); }
  catch { return []; }
}
export function saveCategories(cats: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}
