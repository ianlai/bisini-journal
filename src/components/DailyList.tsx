"use client";
import type { Entry } from "@/lib/types";

export default function DailyList({ entries, date }: { entries: Entry[]; date: string; }) {
  // Group entries by category and take the first (and only) entry per category
  const categoryMap = new Map<string, Entry>();
  entries.filter(e => e.date === date).forEach(e => {
    if (!categoryMap.has(e.category)) {
      categoryMap.set(e.category, e);
    }
  });
  
  const list = Array.from(categoryMap.values()).sort((a, b) => a.category.localeCompare(b.category));
  
  return (
    <section>
      <h2 className="font-semibold my-2">{date} 的紀錄</h2>
      {list.length === 0 ? (
        <p className="opacity-70">今天還沒有內容</p>
      ) : (
        <ul className="space-y-2">
          {list.map(e => (
            <li key={e.id} className="border rounded p-3">
              <div className="text-sm font-medium opacity-70 mb-1">{e.category}</div>
              <div className="text-sm leading-relaxed">{e.text}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
