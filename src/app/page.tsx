"use client";
import { useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import DailyList from "@/components/DailyList";
import CategoryView from "@/components/CategoryView";
import TrackerView from "@/components/TrackerView";
import DatePickerRow from "@/components/DatePickerRow";
import CategoryManager from "@/components/CategoryManager";
import Collapsible from "@/components/Collapsible";

import type { Category, Entry } from "@/lib/types";
import {
  loadEntriesV2,
  saveEntriesV2,
  loadCategoriesV2,
  saveCategoriesV2,
} from "@/lib/storage";
import { today } from "@/lib/date";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<"daily" | "category" | "tracker">("daily");
  const [date, setDate] = useState<string>(today());
  const [showMgr, setShowMgr] = useState(false);

  // keyboard nav for daily tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tab !== "daily") return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const d = new Date(date + "T00:00:00");
      if (e.key === "ArrowLeft") d.setDate(d.getDate() - 1);
      if (e.key === "ArrowRight") d.setDate(d.getDate() + 1);
      setDate(d.toISOString().slice(0, 10));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [date, tab]);

  // boot from LocalStorage (pure v2, no v1 migration)
  useEffect(() => {
    // read v2 data
    const v2Entries = loadEntriesV2();
    const v2Cats = loadCategoriesV2();

    // one-time "done" migration: if missing, infer from text
    const migrated = v2Entries.map((e) =>
      typeof e.done === "boolean"
        ? e
        : { ...e, done: !!(e.text && e.text.trim()) }
    );
    setEntries(migrated);

    // seed default categories when storage is empty
    if (v2Cats.length) {
      setCategories(v2Cats);
    } else {
      const defaults = ["營養品", "寫程式", "學英文", "自媒體"].map(
        (name, i) => ({
          id: uid(), // generate stable id for new category
          name,
          order: i + 1,
        })
      );
      setCategories(defaults); // your existing effect will persist them
    }
  }, []);

  // auto-save v2
  useEffect(() => {
    saveEntriesV2(entries); // persist entries v2
  }, [entries]);

  useEffect(() => {
    saveCategoriesV2(categories); // persist categories v2
  }, [categories]);

  const add = (d: {
    date: string;
    categoryId: string;
    text: string;
    done?: boolean;
  }) => {
    const e: Entry = { id: uid(), ...d };
    setEntries((prev) => {
      // Remove existing entry for same date and category
      const filtered = prev.filter(
        (existing) =>
          !(existing.date === d.date && existing.categoryId === d.categoryId)
      );
      return [e, ...filtered];
    });
    setDate(d.date); // 讓每日視圖立刻顯示
  };

  const remove = (d: { date: string; categoryId: string }) => {
    setEntries((prev) =>
      prev.filter((e) => !(e.date === d.date && e.categoryId === d.categoryId))
    );
    setDate(d.date);
  };

  // --- Category CRUD handlers (id-based) ---

  // create a new category (dedupe by name.trim())
  const createCategory = (name: string) => {
    const n = name.trim();
    if (!n) return;
    // prevent duplicate names
    if (categories.some((c) => c.name === n)) {
      alert("分類名稱重複");
      return;
    }
    const next = { id: uid(), name: n, order: categories.length };
    setCategories((prev) => [...prev, next]);
  };

  // rename a category by id; also keep names unique
  const renameCategory = (id: string, nextName: string) => {
    const n = nextName.trim();
    if (!n) return;
    if (categories.some((c) => c.name === n && c.id !== id)) {
      alert("已有相同名稱的分類");
      return;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: n } : c))
    );
  };

  // delete a category; if mergeToId provided, reassign entries, else remove them
  // delete a category; if mergeToId provided, MERGE by date into the target
  const deleteCategory = (sourceId: string, mergeToId?: string) => {
    if (mergeToId && mergeToId !== sourceId) {
      setEntries((prev) => {
        // split entries
        const src = prev.filter((e) => e.categoryId === sourceId);
        const tgt = prev.filter((e) => e.categoryId === mergeToId);
        const others = prev.filter(
          (e) => e.categoryId !== sourceId && e.categoryId !== mergeToId
        );

        // map date -> (a cloned target entry)
        const byDate = new Map<string, Entry>();
        for (const t of tgt) byDate.set(t.date, { ...t });

        // fold source entries into target-by-date
        for (const s of src) {
          const exist = byDate.get(s.date);
          if (!exist) {
            // no conflict: move s into target
            byDate.set(s.date, { ...s, categoryId: mergeToId });
          } else {
            // conflict: merge text + OR the done flag, keep target id/date
            byDate.set(s.date, {
              ...exist,
              text:
                exist.text && s.text
                  ? `${exist.text}\n${s.text}`
                  : exist.text || s.text || "",
              done: Boolean(exist.done || s.done),
            });
          }
        }

        // final list = others + merged target entries (unique per date)
        return [...others, ...Array.from(byDate.values())];
      });
    } else {
      // no merge target: drop all entries under the deleted category
      setEntries((prev) => prev.filter((e) => e.categoryId !== sourceId));
    }

    // finally remove the category itself
    setCategories((prev) => prev.filter((c) => c.id !== sourceId));
  };

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="animate-fade-in">
        <header className="card p-4 sm:p-6 mb-4 shadow-lg">
          {/* grid: left takes remaining width (wraps), right is auto width */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-6 items-start">
            {/* left: logo + texts; allow wrapping on mobile */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent sm:whitespace-nowrap">
                  Bisini Journal
                </h1>
                <p className="text-muted-foreground text-sm">
                  Track your daily progress and habits
                </p>
              </div>
            </div>

            {/* right: tabs — vertical on mobile, horizontal on ≥sm; sticks to the right */}
            <nav className="flex flex-col gap-2 sm:flex-row sm:gap-3 self-start">
              {(["daily", "category", "tracker"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`btn h-10 px-3 text-sm leading-none
                      inline-flex items-center justify-center gap-2
                      whitespace-nowrap grow-0 shrink-0
                      [&]:min-w-[118px]
                      ${
                        tab === t
                          ? "btn-primary shadow-md"
                          : "btn-secondary hover:shadow-sm"
                      }`}
                >
                  {t === "daily"
                    ? "📅 每日"
                    : t === "category"
                    ? "📂 分類"
                    : "📊 追蹤"}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {tab === "daily" && (
          <div className="space-y-4 animate-slide-in">
            <div className="card p-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  aria-label="前一天"
                  className="btn btn-secondary w-10 h-10 rounded-full hover:scale-105"
                  onClick={() => {
                    const d = new Date(date + "T00:00:00");
                    d.setDate(d.getDate() - 1);
                    setDate(d.toISOString().slice(0, 10));
                  }}
                >
                  ◀
                </button>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    選擇日期
                  </span>
                  <DatePickerRow date={date} setDate={setDate} />
                </div>
                <button
                  aria-label="後一天"
                  className="btn btn-secondary w-10 h-10 rounded-full hover:scale-105"
                  onClick={() => {
                    const d = new Date(date + "T00:00:00");
                    d.setDate(d.getDate() + 1);
                    setDate(d.toISOString().slice(0, 10));
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
            <EntryForm
              categories={categories}
              onAdd={add}
              onRemove={remove}
              selectedDate={date}
              existingEntries={entries}
            />
            <DailyList entries={entries} date={date} />
          </div>
        )}

        {/* Category tab */}
        {tab === "category" && (
          <div className="animate-slide-in space-y-4">
            {/* collapsible manager */}
            <details className="card p-4 sm:p-6">
              <summary className="cursor-pointer select-none flex items-center justify-between">
                <span className="font-semibold">分類管理</span>
                <span
                  className="text-sm text-muted-foreground"
                  onClick={() => setShowMgr((v) => !v)}
                >
                  點擊展開 / 收合
                </span>
              </summary>
              <div className="mt-4">
                {/* Mount the manager inside the panel */}
                <Collapsible open={showMgr}>
                  <CategoryManager
                    categories={categories}
                    entries={entries}
                    onCreate={createCategory}
                    onRename={renameCategory}
                    onDelete={deleteCategory}
                  />
                </Collapsible>
              </div>
            </details>

            {/* existing list view */}
            <CategoryView categories={categories} entries={entries} />
          </div>
        )}

        {tab === "tracker" && (
          <div className="animate-slide-in">
            <TrackerView categories={categories} entries={entries} />
          </div>
        )}
      </div>
    </main>
  );
}
