"use client";
import { useEffect, useState } from "react";
import { today } from "@/lib/date";
import type { Entry } from "@/lib/types";

type Props = {
  categories: string[];
  onAdd: (d: { date: string; category: string; text: string; done?: boolean }) => void;
  onRemove?: (d: { date: string; category: string }) => void;
  selectedDate?: string;
  existingEntries?: Entry[];
};

export default function EntryForm({ categories, onAdd, onRemove, selectedDate, existingEntries = [] }: Props) {
  const [date, setDate] = useState(selectedDate || today());
  const [categoryTexts, setCategoryTexts] = useState<Record<string, string>>({});
  const [categoryDone, setCategoryDone] = useState<Record<string, boolean>>({});
  // Original form state - moved to top to avoid conditional hooks
  const [category, setCategory] = useState(categories[0] ?? "");
  const [text, setText] = useState("");

  // Initialize category texts from existing entries
  useEffect(() => {
    const texts: Record<string, string> = {};
    const dones: Record<string, boolean> = {};
    categories.forEach(cat => {
      const existing = existingEntries.find(e => e.category === cat && e.date === date);
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

  const updateCategoryText = (category: string, text: string) => {
    setCategoryTexts(prev => ({ ...prev, [category]: text }));
    // auto toggle on when user types something
    if (text.trim()) setCategoryDone(prev => ({ ...prev, [category]: true }));
  };

  const toggleDone = (category: string) => {
    setCategoryDone(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const submit = () => {
    categories.forEach(category => {
      const text = (categoryTexts[category] || "").trim();
      const done = !!categoryDone[category];
      const existed = existingEntries.some(e => e.category === category && e.date === date);
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
      <section className="space-y-4">
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category} className="space-y-1">
              <label className="text-sm font-medium opacity-70">{category}</label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                <textarea
                  value={categoryTexts[category] || ""}
                  onChange={(e) => updateCategoryText(category, e.target.value)}
                  placeholder={`今天在${category}方面做了什麼？`}
                  className="w-full border rounded px-3 py-2 min-h-[60px] resize-none"
                  rows={2}
                />
                <button
                  type="button"
                  aria-label="toggle done"
                  onClick={() => toggleDone(category)}
                  className={`h-9 w-9 mt-1 rounded-md border flex items-center justify-center text-lg ${categoryDone[category] ? "bg-fuchsia-600 text-white" : "bg-white"}`}
                >
                  {categoryDone[category] ? "✓" : " "}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={submit}
          className="bg-fuchsia-600 text-white rounded px-4 py-2 hover:bg-fuchsia-700 transition-colors"
        >
          儲存 {date} 的內容
        </button>
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
    <section className="grid gap-2 md:grid-cols-[180px_200px_1fr_auto]">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-2 py-1"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submitOriginal()}
        placeholder="今天做了什麼？(Enter 新增)"
        className="border rounded px-2 py-1"
      />
      <button
        onClick={submitOriginal}
        className="bg-fuchsia-600 text-white rounded px-3"
      >
        新增
      </button>
    </section>
  );
}
