"use client";
import type { Entry } from "@/lib/types";

export default function DailyList({
  entries,
  date,
}: {
  entries: Entry[];
  date: string;
}) {
  // Group entries by category and take the first (and only) entry per category
  const categoryMap = new Map<string, Entry>();
  entries
    .filter((e) => e.date === date)
    .forEach((e) => {
      if (!categoryMap.has(e.categoryId)) {
        categoryMap.set(e.categoryId, e);
      }
    });

  const list = Array.from(categoryMap.values()).sort((a, b) =>
    a.categoryId.localeCompare(b.categoryId)
  );

  return (
    <section className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📋</span>
        </div>
        <h2 className="text-xl font-semibold">{date} 的紀錄</h2>
        {list.length > 0 && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {list.length} 項
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-muted-foreground text-lg">今天還沒有內容</p>
          <p className="text-muted-foreground text-sm mt-1">
            開始記錄你的日常吧！
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((e, index) => (
            <div
              key={e.id}
              className="card p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {e.categoryId}
                    </span>
                    {e.done && (
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                        ✓ 已完成
                      </span>
                    )}
                  </div>
                  <div className="text-foreground leading-relaxed">
                    {e.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
