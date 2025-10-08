"use client";
import { useEffect, useRef, useState } from "react";
import { today } from "@/lib/date";
import type { Entry } from "@/lib/types";

type Props = {
  categories: string[];
  onAdd: (d: {
    date: string;
    category: string;
    text: string;
    done?: boolean;
  }) => void;
  onRemove?: (d: { date: string; category: string }) => void;
  selectedDate?: string;
  existingEntries?: Entry[];
};

export default function EntryForm({
  categories,
  onAdd,
  onRemove,
  selectedDate,
  existingEntries = [],
}: Props) {
  const [date, setDate] = useState(selectedDate || today());
  const [categoryTexts, setCategoryTexts] = useState<Record<string, string>>(
    {}
  );
  const [categoryDone, setCategoryDone] = useState<Record<string, boolean>>({});
  // Per-category debounce timers for autosave in daily mode
  const saveTimersRef = useRef<Record<string, number>>({});
  // Original form state - moved to top to avoid conditional hooks
  const [category, setCategory] = useState(categories[0] ?? "");
  const [text, setText] = useState("");

  // Initialize category texts from existing entries
  useEffect(() => {
    const texts: Record<string, string> = {};
    const dones: Record<string, boolean> = {};
    categories.forEach((cat) => {
      const existing = existingEntries.find(
        (e) => e.category === cat && e.date === date
      );
      texts[cat] = existing?.text || "";
      dones[cat] = existing?.done ?? false;
    });
    setCategoryTexts(texts);
    setCategoryDone(dones);
  }, [categories, date, existingEntries]);

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  // Update category when categories change (for original form)
  useEffect(() => {
    if (!categories.includes(category) && categories[0])
      setCategory(categories[0]);
  }, [categories, category]);

  // Save helper used by autosave flows
  const saveForCategory = (
    categoryKey: string,
    nextText?: string,
    nextDone?: boolean
  ) => {
    const t = (
      nextText !== undefined ? nextText : categoryTexts[categoryKey] || ""
    ).trim();
    const d = nextDone !== undefined ? nextDone : !!categoryDone[categoryKey];
    const existed = existingEntries.some(
      (e) => e.category === categoryKey && e.date === date
    );
    if (t || d) {
      onAdd({ date, category: categoryKey, text: t, done: d });
    } else if (existed && onRemove) {
      onRemove({ date, category: categoryKey });
    }
  };

  const updateCategoryText = (category: string, text: string) => {
    setCategoryTexts((prev) => ({ ...prev, [category]: text }));
    // auto toggle on when user types something
    const willBeDone = text.trim() ? true : categoryDone[category];
    if (text.trim()) setCategoryDone((prev) => ({ ...prev, [category]: true }));

    // Debounce save for this category
    const timers = saveTimersRef.current;
    if (timers[category]) window.clearTimeout(timers[category]);
    timers[category] = window.setTimeout(() => {
      saveForCategory(category, text, willBeDone);
    }, 500);
  };

  const toggleDone = (category: string) => {
    setCategoryDone((prev) => {
      const newDone = !prev[category];
      // Immediate save on toggle using latest text + new done value
      saveForCategory(category, categoryTexts[category] || "", newDone);
      return { ...prev, [category]: newDone };
    });
  };

  const submit = () => {
    categories.forEach((category) => {
      const text = (categoryTexts[category] || "").trim();
      const done = !!categoryDone[category];
      const existed = existingEntries.some(
        (e) => e.category === category && e.date === date
      );
      if (text || done) {
        onAdd({ date, category, text, done });
      } else if (existed && onRemove) {
        onRemove({ date, category });
      }
    });
  };

  // If we're in daily mode with selectedDate, show category text boxes
  if (selectedDate) {
    return (
      <section className="card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✏️</span>
          </div>
          <h2 className="text-xl font-semibold">每日記錄</h2>
        </div>

        <div className="grid gap-6">
          {categories.map((category, index) => (
            <div
              key={category}
              className="card p-4 space-y-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-foreground">
                  {category}
                </label>
                <button
                  type="button"
                  aria-label="toggle done"
                  onClick={() => toggleDone(category)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-105 ${
                    categoryDone[category]
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-muted border-2 border-dashed border-muted-foreground/30 hover:border-green-500/50"
                  }`}
                >
                  {categoryDone[category] ? "✓" : "+"}
                </button>
              </div>
              <textarea
                rows={5}
                className="
                  input px-4 py-3 text-base leading-relaxed
                  min-h-40 sm:min-h-36   /* ≈160px on mobile, a bit smaller on desktop */
                "
                value={categoryTexts[category] || ""}
                onChange={(e) => updateCategoryText(category, e.target.value)}
                placeholder={`今天在${category}方面做了什麼？`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {/* visual hint only */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-70"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            已自動儲存
          </span>
        </div>
      </section>
    );
  }

  // Original form for other tabs

  const submitOriginal = () => {
    if (!text.trim() || !category) return;
    onAdd({ date, category, text: text.trim() });
    setText("");
  };

  return (
    <section className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">➕</span>
        </div>
        <h2 className="text-xl font-semibold">快速新增</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[180px_200px_1fr_auto] items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            分類
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            內容
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitOriginal()}
            placeholder="今天做了什麼？(Enter 新增)"
            className="input"
          />
        </div>
        <button
          onClick={submitOriginal}
          className="btn btn-primary px-6 py-2.5 font-medium"
        >
          ➕ 新增
        </button>
      </div>
    </section>
  );
}
