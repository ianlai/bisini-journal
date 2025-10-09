"use client";
import { useEffect, useRef, useState } from "react";
import { today } from "@/lib/date";
import type { Entry, Category } from "@/lib/types";

type Props = {
  categories: Category[]; // <-- use Category[]
  onAdd: (d: {
    date: string;
    categoryId: string;
    text: string;
    done?: boolean;
  }) => void;
  onRemove?: (d: { date: string; categoryId: string }) => void;
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
  // shared date state (defaults to today, or the provided selectedDate)
  const [date, setDate] = useState(selectedDate || today());

  // per-category text/done maps keyed by categoryId
  const [categoryTexts, setCategoryTexts] = useState<Record<string, string>>(
    {}
  );
  const [categoryDone, setCategoryDone] = useState<Record<string, boolean>>({});

  // debounce timers per categoryId
  const saveTimersRef = useRef<Record<string, number>>({});

  // simple "quick add" form state for non-daily tabs (id-based)
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [text, setText] = useState("");

  // keep categoryId valid when categories change
  useEffect(() => {
    if (!categories.some((c) => c.id === categoryId) && categories[0]) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // initialize per-category text/done from existing entries for the current date
  useEffect(() => {
    const texts: Record<string, string> = {};
    const dones: Record<string, boolean> = {};
    for (const c of categories) {
      const existing = existingEntries.find(
        (e) => e.categoryId === c.id && e.date === date
      );
      texts[c.id] = existing?.text ?? "";
      dones[c.id] = existing?.done ?? false;
    }
    setCategoryTexts(texts);
    setCategoryDone(dones);
  }, [categories, date, existingEntries]);

  // sync date if parent controls it (daily mode)
  useEffect(() => {
    if (selectedDate) setDate(selectedDate);
  }, [selectedDate]);

  // clear any pending debounce timers on unmount
  useEffect(() => {
    return () => {
      const timers = saveTimersRef.current;
      Object.values(timers).forEach((id) => clearTimeout(id));
    };
  }, []);

  // save helper (per categoryId)
  const saveForCategory = (
    cid: string,
    nextText?: string,
    nextDone?: boolean
  ) => {
    const t = (
      nextText !== undefined ? nextText : categoryTexts[cid] || ""
    ).trim();
    const d = nextDone !== undefined ? nextDone : !!categoryDone[cid];
    const existed = existingEntries.some(
      (e) => e.categoryId === cid && e.date === date
    );
    if (t || d) {
      onAdd({ date, categoryId: cid, text: t, done: d });
    } else if (existed && onRemove) {
      onRemove({ date, categoryId: cid });
    }
  };

  const updateCategoryText = (cid: string, value: string) => {
    setCategoryTexts((prev) => ({ ...prev, [cid]: value }));

    // auto-mark done when user types something (optional UX)
    if (value.trim()) {
      setCategoryDone((prev) => ({ ...prev, [cid]: true }));
    }
    const willBeDone = value.trim() ? true : categoryDone[cid];

    // debounce save for this category
    const timers = saveTimersRef.current;
    if (timers[cid]) clearTimeout(timers[cid]);
    timers[cid] = window.setTimeout(() => {
      saveForCategory(cid, value, willBeDone);
    }, 500);
  };

  const toggleDone = (cid: string) => {
    setCategoryDone((prev) => {
      const next = !prev[cid];
      // save immediately using latest text and new done
      saveForCategory(cid, categoryTexts[cid] || "", next);
      return { ...prev, [cid]: next };
    });
  };

  // commit all categories for the current date (if you still need a manual submit)
  const submitAllForDate = () => {
    for (const c of categories) {
      const t = (categoryTexts[c.id] || "").trim();
      const d = !!categoryDone[c.id];
      const existed = existingEntries.some(
        (e) => e.categoryId === c.id && e.date === date
      );
      if (t || d) onAdd({ date, categoryId: c.id, text: t, done: d });
      else if (existed && onRemove) onRemove({ date, categoryId: c.id });
    }
  };

  // DAILY MODE (selectedDate provided): render per-category text areas
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
          {categories.map((c, index) => (
            <div
              key={c.id}
              className="card p-4 space-y-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-foreground">
                  {c.name}
                </label>
                <button
                  type="button"
                  aria-label="toggle done"
                  onClick={() => toggleDone(c.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-105 ${
                    categoryDone[c.id]
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-muted border-2 border-dashed border-muted-foreground/30 hover:border-green-500/50"
                  }`}
                >
                  {categoryDone[c.id] ? "✓" : "+"}
                </button>
              </div>

              <textarea
                rows={5}
                className="input px-4 py-3 text-base leading-relaxed min-h-40 sm:min-h-36"
                value={categoryTexts[c.id] || ""}
                onChange={(e) => updateCategoryText(c.id, e.target.value)}
                placeholder={`今天在「${c.name}」方面做了什麼？`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
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

  // QUICK-ADD (other tabs): single row form
  const submitOriginal = () => {
    const t = text.trim();
    if (!t || !categoryId) return;
    onAdd({ date, categoryId, text: t });
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
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
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
