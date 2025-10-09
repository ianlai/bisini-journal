"use client";
import { useEffect, useMemo, useState } from "react";
import type { Category, Entry } from "@/lib/types";

export default function CategoryView({
  categories,
  entries,
}: {
  categories: Category[];
  entries: Entry[];
}) {
  // selected categoryId (not the whole object / not name)
  const [sel, setSel] = useState<string>(categories[0]?.id ?? "");

  // keep a fast lookup from id -> name for display
  const nameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  // ensure sel stays valid when categories change
  useEffect(() => {
    const has = categories.some((c) => c.id === sel);
    if (!has && categories[0]) setSel(categories[0].id);
  }, [categories, sel]);

  const list = useMemo(
    () =>
      entries
        .filter((e) => e.categoryId === sel)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [entries, sel]
  );

  return (
    <section className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📂</span>
        </div>
        <h2 className="text-xl font-semibold">分類視圖</h2>
        <div className="ml-auto">
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="input w-48"
            disabled={categories.length === 0}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {" "}
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📁</span>
          </div>
          <p className="text-muted-foreground text-lg">此分類目前沒有紀錄</p>
          <p className="text-muted-foreground text-sm mt-1">
            選擇其他分類或開始記錄吧！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">
              {nameById.get(sel) ?? "未選擇"}
            </h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {list.length} 項紀錄
            </span>
          </div>
          <div className="grid gap-3">
            {list.map((e, index) => (
              <div
                key={e.id}
                className="card p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-2 font-medium">
                      {new Date(e.date + "T00:00:00").toLocaleDateString(
                        "zh-TW",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        }
                      )}
                    </div>
                    <div className="text-foreground leading-relaxed">
                      {e.text}
                    </div>
                    {e.done && (
                      <div className="mt-2">
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          ✓ 已完成
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
