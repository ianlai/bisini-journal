"use client";
import { useEffect, useMemo, useState } from "react";
import type { Entry } from "@/lib/types";

export default function CategoryView({ categories, entries }:{
  categories: string[]; entries: Entry[];
}) {
  const [sel, setSel] = useState(categories[0] ?? "");
  useEffect(()=>{ if (!sel && categories[0]) setSel(categories[0]); },[categories, sel]);

  const list = useMemo(
    () => entries.filter(e=> e.category===sel).sort((a,b)=> a.date < b.date ? 1 : -1),
    [entries, sel]
  );

  return (
    <section>
      <div className="flex items-center gap-2 my-2">
        <h2 className="font-semibold">分類視圖</h2>
        <select value={sel} onChange={e=>setSel(e.target.value)} className="border rounded px-2 py-1">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {list.length===0 ? <p className="opacity-70">此分類目前沒有紀錄</p> :
        <ul className="space-y-2">
          {list.map(e=>(
            <li key={e.id} className="border rounded p-2">
              <div className="text-sm opacity-70">{e.date}</div>
              <div>{e.text}</div>
            </li>
          ))}
        </ul>
      }
    </section>
  );
}
