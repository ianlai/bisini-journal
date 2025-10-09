import type { Entry, Category } from "./types";

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

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

// pick a safe storage in SSR
const safeStorage: StorageLike =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

// generic helpers (no any)
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return fallback;
    // parse as unknown then assert to T (you can add runtime validation later)
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors
  }
}

// concrete keys
const KEYS = {
  entriesV2: "bisini.entries.v2",
  categoriesV2: "bisini.categories.v2",
};

// typed apis (no any)
export const loadEntriesV2 = (): Entry[] =>
  loadJSON<Entry[]>(KEYS.entriesV2, []);

export const saveEntriesV2 = (list: Entry[]): void =>
  saveJSON<Entry[]>(KEYS.entriesV2, list);

export const loadCategoriesV2 = (): Category[] =>
  loadJSON<Category[]>(KEYS.categoriesV2, []);

export const saveCategoriesV2 = (list: Category[]): void =>
  saveJSON<Category[]>(KEYS.categoriesV2, list);
