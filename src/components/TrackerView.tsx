"use client";
import type { Category, Entry } from "@/lib/types";
import { useMemo } from "react";

export default function TrackerView({
  categories,
  entries,
}: {
  categories: Category[];
  entries: Entry[];
}) {
  // Calculate the date range (52 weeks) starting from the first active week
  const weeks = useMemo(() => {
    const getStartOfISOWeek = (d: Date) => {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const js = start.getDay();
      const isoIndex = (js + 6) % 7; // Monday=0
      start.setDate(start.getDate() - isoIndex);
      return start;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (entries.length === 0) {
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(today.getDate() - 365);
      return generateWeeks(getStartOfISOWeek(oneYearAgo), 52);
    }

    const earliest = entries
      .map((e) => new Date(e.date + "T00:00:00"))
      .reduce(
        (min, d) => (d < min ? d : min),
        new Date(entries[0].date + "T00:00:00")
      );

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

  // v2: check by categoryId instead of category name
  const hasEntryFor = (categoryId: string, date: Date) => {
    const ds = date.toISOString().slice(0, 10);
    return entries.some(
      (e) => e.categoryId === categoryId && e.date === ds && e.done === true
    );
  };

  type Palette = { off: string; on: string; legend: string };

  const PALETTES: Palette[] = [
    {
      // red
      off: "bg-red-50 border-red-100 dark:bg-[#2d1b1b] dark:border-[#3d2525]",
      on: "bg-red-500 border-red-400 shadow-sm dark:bg-gradient-to-br dark:from-red-400 dark:to-red-500 dark:border-red-400 dark:shadow-md",
      legend: "bg-red-500 border-red-400",
    },
    {
      // amber
      off: "bg-amber-50 border-amber-100 dark:bg-[#2a2528] dark:border-[#3a3337]",
      on: "bg-amber-500 border-amber-400 shadow-sm dark:bg-gradient-to-br dark:from-amber-400 dark:to-amber-500 dark:border-amber-400 dark:shadow-md",
      legend: "bg-amber-500 border-amber-400",
    },
    {
      // blue
      off: "bg-blue-50 border-blue-100 dark:bg-[#1b1f2d] dark:border-[#252a3d]",
      on: "bg-blue-500 border-blue-400 shadow-sm dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-500 dark:border-blue-400 dark:shadow-md",
      legend: "bg-blue-500 border-blue-400",
    },
    {
      // violet/purple
      off: "bg-violet-50 border-violet-100 dark:bg-[#251b2d] dark:border-[#35253d]",
      on: "bg-violet-500 border-violet-400 shadow-sm dark:bg-gradient-to-br dark:from-purple-400 dark:to-purple-500 dark:border-purple-400 dark:shadow-md",
      legend: "bg-violet-500 border-violet-400",
    },
  ];

  const paletteByIndex = (i: number): Palette => PALETTES[i % PALETTES.length];

  const dayLabels = ["M", "T", "W", "R", "F", "U", "S"]; // Monday-first

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
        {categories.map((c, categoryIndex) => {
          const pal = paletteByIndex(categoryIndex); // <- choose by order
          return (
            <div
              key={c.id}
              className="animate-fade-in"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* legend dot */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${pal.legend}`}
                  />
                  <h3 className="text-lg font-medium text-foreground">
                    {c.name}
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground">過去 52 週</div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* top week indices */}
                  <div className="flex gap-0.5 pl-8 mb-2 text-[10px] text-muted-foreground select-none">
                    {weeks.map((_, wi) => (
                      <div key={wi} className="w-4 flex justify-center">
                        {wi + 1 === 1 ||
                        wi + 1 === 10 ||
                        wi + 1 === 20 ||
                        wi + 1 === 30 ||
                        wi + 1 === 40 ||
                        wi + 1 === 50
                          ? wi + 1
                          : ""}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {/* left day labels */}
                    <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground select-none w-6 items-end pr-1">
                      {dayLabels.map((d, i) => (
                        <div key={i} className="h-4 leading-4 font-medium">
                          {d}
                        </div>
                      ))}
                    </div>
                    {/* weeks grid */}
                    <div className="flex gap-0.5">
                      {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-0.5">
                          {week.map((day, di) => {
                            const done = hasEntryFor(c.id, day);
                            return (
                              <div
                                key={di}
                                title={`${day.toISOString().slice(0, 10)} ${
                                  c.name
                                } ${done ? "完成" : "未完成"}`}
                                className={`w-4 h-4 rounded-sm border transition-all duration-200 hover:scale-110 ${
                                  done ? pal.on : pal.off
                                }`}
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
          );
        })}
      </div>
    </section>
  );
}
