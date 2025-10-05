"use client";
import { useEffect, useMemo, useState } from "react";
import EntryForm from "@/components/EntryForm";
import DailyList from "@/components/DailyList";
import CategoryView from "@/components/CategoryView";
import TrackerView from "@/components/TrackerView";
import type { Entry } from "@/lib/types";
import { loadEntries, saveEntries, loadCategories, saveCategories } from "@/lib/storage";
import { today } from "@/lib/date";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tab, setTab] = useState<"daily"|"category"|"tracker">("daily");
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
      setDate(d.toISOString().slice(0,10));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [date, tab]);

  // boot from LocalStorage
  useEffect(() => {
    const loaded = loadEntries();
    // one-time migration: if done is undefined but text exists, set done = true
    const migrated = loaded.map(e => (
      typeof e.done === "boolean" ? e : { ...e, done: !!(e.text && e.text.trim()) }
    ));
    setEntries(migrated);
    const cs = loadCategories();
    setCategories(cs.length ? cs : ["營養品","演算法","英文","自媒體"]);
  }, []);
  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveCategories(categories), [categories]);

  const add = (d:{date:string; category:string; text:string; done?: boolean}) => {
    const e: Entry = { id: uid(), ...d };
    setEntries(prev => {
      // Remove existing entry for same date and category
      const filtered = prev.filter(existing => !(existing.date === d.date && existing.category === d.category));
      return [e, ...filtered];
    });
    setDate(d.date); // 讓每日視圖立刻顯示
  };

  const remove = (d:{date:string; category:string}) => {
    setEntries(prev => prev.filter(e => !(e.date === d.date && e.category === d.category)));
    setDate(d.date);
  };

  const dailyEntries = useMemo(() => entries.filter(e => e.date === date), [entries, date]);

  return (
    <main className="p-5 max-w-4xl mx-auto space-y-4">
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Bisini Journal</h1>
        <nav className="ml-auto flex gap-2">
          {(["daily","category","tracker"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-3 py-1 rounded-full border ${tab===t? "border-fuchsia-500" : "border-neutral-300"}`}>
              {t==="daily"?"每日":t==="category"?"分類":"追蹤"}
            </button>
          ))}
        </nav>
      </header>

      {tab==="daily" && (
        <>
          <div className="flex items-center gap-2">
            <button aria-label="前一天" className="px-2 py-1" onClick={()=>{
              const d=new Date(date+"T00:00:00"); d.setDate(d.getDate()-1); setDate(d.toISOString().slice(0,10));
            }}>◀</button>
            <span className="text-sm opacity-70">選擇日期：</span>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-2 py-1"/>
            <button aria-label="後一天" className="px-2 py-1" onClick={()=>{
              const d=new Date(date+"T00:00:00"); d.setDate(d.getDate()+1); setDate(d.toISOString().slice(0,10));
            }}>▶</button>
          </div>
          <EntryForm categories={categories} onAdd={add} onRemove={remove} selectedDate={date} existingEntries={entries} />
          <DailyList entries={entries} date={date} />
        </>
      )}

      {tab==="category" && (
        <CategoryView categories={categories} entries={entries} />
      )}

      {tab==="tracker" && (
        <TrackerView categories={categories} entries={entries} />
      )}
    </main>
  );
}
