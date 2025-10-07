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
      "營養品": { 
        off: "bg-[#2d1b1b] border-[#3d2525]", // dark red: lab(13 23 13) converted to hex
        on: "bg-gradient-to-br from-red-400 to-red-500 border-red-400 shadow-md" 
      },
      "演算法": { 
        off: "bg-[#2a2528] border-[#3a3337]", // dark brown: lab(17 12 19) converted to hex
        on: "bg-gradient-to-br from-amber-400 to-amber-500 border-amber-400 shadow-md" 
      },
      "英文": { 
        off: "bg-[#1b1f2d] border-[#252a3d]", // dark blue: lab(13 23 13) with blue hue
        on: "bg-gradient-to-br from-blue-400 to-blue-500 border-blue-400 shadow-md" 
      },
      "自媒體": { 
        off: "bg-[#251b2d] border-[#35253d]", // dark purple: lab(13 23 13) with purple hue
        on: "bg-gradient-to-br from-purple-400 to-purple-500 border-purple-400 shadow-md" 
      },
    };
    const c = map[category] || { off: "bg-gray-800 border-gray-700", on: "bg-gradient-to-br from-gray-400 to-gray-500 border-gray-400 shadow-md" };
    return done ? c.on : c.off;
  };

  const dayLabels = ["M","T","W","R","F","U","S"]; // Monday-first

  return (
    <section className="card p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📊</span>
        </div>
        <h2 className="text-xl font-semibold">習慣追蹤</h2>
        <p className="text-muted-foreground text-sm">查看你的習慣養成進度</p>
      </div>
      
      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <div key={category} className="animate-fade-in" style={{ animationDelay: `${categoryIndex * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${colorFor(category, true).split(' ')[0]} border-2 ${colorFor(category, true).split(' ')[1]}`}></div>
                <h3 className="text-lg font-medium text-foreground">{category}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                過去 52 週
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* top week indices */}
                <div className="flex gap-0.5 pl-8 mb-2 text-[10px] text-muted-foreground select-none">
                  {weeks.map((_, wi) => (
                    <div key={wi} className="w-4 flex justify-center">
                      {(wi+1===1||wi+1===10||wi+1===20||wi+1===30||wi+1===40||wi+1===50) ? (wi+1) : ""}
                    </div>
                  ))}
                </div>
                <div className="flex gap-0.5">
                  {/* left day labels */}
                  <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground select-none w-6 items-end pr-1">
                    {dayLabels.map((d,i)=>(
                      <div key={i} className="h-4 leading-4 font-medium">{d}</div>
                    ))}
                  </div>
                  {/* weeks grid */}
                  <div className="flex gap-0.5">
                    {weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-0.5">
                        {week.map((day, di) => {
                          const done = hasEntryFor(category, day);
                          return (
                            <div
                              key={di}
                              title={`${day.toISOString().slice(0,10)} ${category} ${done ? "完成" : "未完成"}`}
                              className={`w-4 h-4 rounded-sm border transition-all duration-200 hover:scale-110 ${colorFor(category, done)}`}
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
      </div>
    </section>
  );
}
