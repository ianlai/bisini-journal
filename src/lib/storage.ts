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

// --- v2 keys ---
const ENTRIES_V2_KEY = "entries_v2";
const CATS_V2_KEY = "categories_v2";

// --- v2 api ---
export function loadEntriesV2(): any[] {
  try { return JSON.parse(localStorage.getItem(ENTRIES_V2_KEY) || "[]"); }
  catch { return []; }
}
export function saveEntriesV2(entries: any[]) {
  localStorage.setItem(ENTRIES_V2_KEY, JSON.stringify(entries));
}
export function loadCategoriesV2(): any[] {
  try { return JSON.parse(localStorage.getItem(CATS_V2_KEY) || "[]"); }
  catch { return []; }
}
export function saveCategoriesV2(cats: any[]) {
  localStorage.setItem(CATS_V2_KEY, JSON.stringify(cats));
}

// --- one-shot migration from v1 (string categories) to v2 (Category objects) ---
// uid: a function to generate ids (inject your uid so it's consistent with the app)
export function loadAllWithMigration(uid: () => string) {
  // if v2 exists, just use it
  const v2cats = loadCategoriesV2();
  const v2entries = loadEntriesV2();
  if (v2cats.length || v2entries.length) {
    return { categories: v2cats, entries: v2entries };
  }

  // else: read v1
  const v1entries = loadEntries();      // your existing v1 API (Entry had "category": string)
  const v1cats = loadCategories();      // string[]

  // build Category[] keeping original order; also include any names found only in entries
  const seen = new Set<string>();
  const orderedNames = [
    ...v1cats.filter(n => (seen.has(n) ? false : (seen.add(n), true))),
    ...v1entries
      .map((e: any) => e.category)
      .filter((n: string) => n && !seen.has(n) && (seen.add(n), true)),
  ];

  const nameToId = new Map<string, string>();
  const categories = orderedNames.map((name, order) => {
    const id = uid();
    nameToId.set(name, id);
    return { id, name, order };
  });

  // transform entries: category -> categoryId
  const entries = v1entries.map((e: any) => ({
    id: e.id,
    date: e.date,
    text: e.text,
    done: e.done,
    categoryId: nameToId.get(e.category)!, // assume mapped; "!" since we covered names above
  }));

  // persist v2 so next boot is fast
  saveCategoriesV2(categories);
  saveEntriesV2(entries);

  return { categories, entries };
}