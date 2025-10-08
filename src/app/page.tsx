"use client";
import { useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import DailyList from "@/components/DailyList";
import CategoryView from "@/components/CategoryView";
import TrackerView from "@/components/TrackerView";
import DatePickerRow from "@/components/DatePickerRow";
import type { Entry } from "@/lib/types";
import {
  loadEntries,
  saveEntries,
  loadCategories,
  saveCategories,
} from "@/lib/storage";
import { today } from "@/lib/date";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tab, setTab] = useState<"daily" | "category" | "tracker">("daily");
  const [date, setDate] = useState<string>(today());
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

  // boot from LocalStorage
  useEffect(() => {
    const loaded = loadEntries();
    // one-time migration: if done is undefined but text exists, set done = true
    const migrated = loaded.map((e) =>
      typeof e.done === "boolean"
        ? e
        : { ...e, done: !!(e.text && e.text.trim()) }
    );
    setEntries(migrated);
    const cs = loadCategories();
    setCategories(cs.length ? cs : ["營養品", "演算法", "英文", "自媒體"]);
  }, []);
  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveCategories(categories), [categories]);

  const add = (d: {
    date: string;
    category: string;
    text: string;
    done?: boolean;
  }) => {
    const e: Entry = { id: uid(), ...d };
    setEntries((prev) => {
      // Remove existing entry for same date and category
      const filtered = prev.filter(
        (existing) =>
          !(existing.date === d.date && existing.category === d.category)
      );
      return [e, ...filtered];
    });
    setDate(d.date); // 讓每日視圖立刻顯示
  };

  const remove = (d: { date: string; category: string }) => {
    setEntries((prev) =>
      prev.filter((e) => !(e.date === d.date && e.category === d.category))
    );
    setDate(d.date);
  };

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="animate-fade-in">
        <header className="card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Bisini Journal
                </h1>
                <p className="text-muted-foreground text-sm">
                  Track your daily progress and habits
                </p>
              </div>
            </div>
            <nav className="w-full">
              <div
                className="flex flex-col sm:flex-row gap-2 sm:gap-3
                  items-center sm:justify-end
                  [&>button]:w-[120px] sm:[&>button]:w-[120px]  /* same width */
  "
              >
                {(["daily", "category", "tracker"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`
          btn h-10 text-sm leading-none px-3
          inline-flex items-center justify-center gap-2
          grow-0 shrink-0 whitespace-nowrap
          ${
            tab === t
              ? "btn-primary shadow-md"
              : "btn-secondary hover:shadow-sm"
          }
        `}
                  >
                    {t === "daily"
                      ? "📅 每日"
                      : t === "category"
                      ? "📂 分類"
                      : "📊 追蹤"}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </header>

        {tab === "daily" && (
          <div className="space-y-6 animate-slide-in">
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

        {tab === "category" && (
          <div className="animate-slide-in">
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
