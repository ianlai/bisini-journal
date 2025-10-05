"use client";
import type { Entry } from "@/lib/types";
import { useMemo } from "react";

export default function TrackerView({ categories, entries }:{
  categories: string[]; entries: Entry[];
}) {
  // Calculate the date range (52 weeks) starting from the first active week
  const weeks = useMemo(() => {
    const getStartOfISOWeek = (d: Date) => {
      const start = new Date(d);
      start.setHours(0,0,0,0);
      const js = start.getDay();
      const isoIndex = (js + 6) % 7; // Monday=0
      start.setDate(start.getDate() - isoIndex);
      return start;
    };

    const today = new Date();
    today.setHours(0,0,0,0);

    if (entries.length === 0) {
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(today.getDate() - 365);
      return generateWeeks(getStartOfISOWeek(oneYearAgo), 52);
    }

    const earliest = entries
      .map(e => new Date(e.date + "T00:00:00"))
      .reduce((min, d) => d < min ? d : min, new Date(entries[0].date + "T00:00:00"));

    return generateWeeks(getStartOfISOWeek(earliest), 52);
  }, [entries]);

  function generateWeeks(startDate: Date, weekCount: number) {
    const weeks: Date[][] = [];
    for (let w = 0; w < weekCount; w++) {
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + w * 7 + i);
        days.push(d);
      }
      weeks.push(days);
    }
    return weeks;
  }

  const hasEntryFor = (category: string, date: Date) => {
    const ds = date.toISOString().slice(0, 10);
    return entries.some(e => e.category === category && e.date === ds && e.done === true);
  };

  const colorFor = (category: string, done: boolean) => {
    const map: Record<string, { off: string; on: string }> = {
      "營養品": { off: "bg-rose-900", on: "bg-rose-400" },
      "演算法": { off: "bg-amber-900", on: "bg-amber-400" },
      "英文": { off: "bg-sky-900", on: "bg-sky-400" },
      "自媒體": { off: "bg-violet-900", on: "bg-violet-400" },
    };
    const c = map[category] || { off: "bg-neutral-900", on: "bg-neutral-400" };
    return done ? c.on : c.off;
  };

  const dayLabels = ["M","T","W","R","F","U","S"]; // Monday-first

  return (
    <section className="space-y-6">
      {categories.map(category => (
        <div key={category}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-80">{category}</div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* top week indices */}
              <div className="flex gap-1 pl-6 mb-1 text-[10px] text-gray-500 select-none">
                {weeks.map((_, wi) => (
                  <div key={wi} className="w-3 flex justify-center">
                    {(wi+1===1||wi+1===10||wi+1===20||wi+1===30||wi+1===40||wi+1===50) ? (wi+1) : ""}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {/* left day labels */}
                <div className="flex flex-col gap-1 text-[10px] text-gray-500 select-none w-5 items-end pr-1">
                  {dayLabels.map((d,i)=>(
                    <div key={i} className="h-3 leading-3">{d}</div>
                  ))}
                </div>
                {/* weeks grid */}
                <div className="flex gap-1">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => {
                        const done = hasEntryFor(category, day);
                        return (
                          <div
                            key={di}
                            title={`${day.toISOString().slice(0,10)} ${category} ${done ? "done" : "none"}`}
                            className={`w-3 h-3 rounded-sm ${colorFor(category, done)}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
