"use client";
import { useMemo, useState } from "react";
import type { Category, Entry } from "@/lib/types";

export default function CategoryManager({
  categories,
  entries,
  onCreate,
  onRename,
  onDelete,
}: {
  categories: Category[];
  entries: Entry[];
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, mergeToId?: string) => void;
}) {
  // local states
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mergeToId, setMergeToId] = useState<string>("");

  // precompute entry counts per category
  const countById = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + 1);
    }
    return map;
  }, [entries]);

  // helpers
  const beginEdit = (c: Category) => {
    setEditingId(c.id);
    setEditingName(c.name);
  };
  const commitEdit = () => {
    if (!editingId) return;
    onRename(editingId, editingName);
    setEditingId(null);
    setEditingName("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const askDelete = (id: string) => {
    setConfirmDeleteId(id);
    setMergeToId(""); // reset selection
  };
  const commitDelete = () => {
    if (!confirmDeleteId) return;
    onDelete(confirmDeleteId, mergeToId || undefined);
    setConfirmDeleteId(null);
    setMergeToId("");
  };
  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setMergeToId("");
  };

  return (
    <section className="card p-4 sm:p-6">
      {/* header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🗂</span>
        </div>
        <h3 className="text-lg font-semibold">分類管理</h3>
      </div>

      {/* create */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = newName.trim();
          if (!n) return;
          onCreate(n);
          setNewName("");
        }}
      >
        <input
          className="input flex-1"
          placeholder="新增分類名稱…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn btn-primary h-10 px-4">新增</button>
      </form>

      {/* list */}
      <ul className="mt-4 space-y-2">
        {categories.map((c, idx) => {
          const count = countById.get(c.id) || 0;
          const isEditing = editingId === c.id;
          const isDeleting = confirmDeleteId === c.id;
          return (
            <li key={c.id} className="rounded-lg border p-3">
              {/* normal row */}
              {!isEditing && !isDeleting && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-muted-foreground shrink-0 w-6 text-right">
                      {idx + 1}
                    </span>
                    <span className="font-medium truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 rounded-full border px-2 py-0.5">
                      {count} 項
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-secondary h-8 px-2"
                      onClick={() => beginEdit(c)}
                      title="Rename"
                      type="button"
                    >
                      ✎
                    </button>
                    <button
                      className="btn h-8 px-2"
                      onClick={() => askDelete(c.id)}
                      title="Delete"
                      type="button"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )}

              {/* edit row */}
              {isEditing && (
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                    autoFocus
                  />
                  <button
                    className="btn btn-primary h-8 px-3"
                    onClick={commitEdit}
                    type="button"
                    title="Save"
                  >
                    ✔
                  </button>
                  <button
                    className="btn btn-secondary h-8 px-3"
                    onClick={cancelEdit}
                    type="button"
                    title="Cancel"
                  >
                    ✖
                  </button>
                </div>
              )}

              {/* delete confirm (with optional merge) */}
              {isDeleting && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="text-sm">
                    刪除 <span className="font-medium underline">{c.name}</span>
                    。 你要把該分類的日記
                    <span className="font-medium">合併到其他分類</span>嗎？
                    （留白＝直接刪除這些日記）
                  </div>
                  <div className="flex gap-2 sm:ml-auto">
                    <select
                      className="input w-44"
                      value={mergeToId}
                      onChange={(e) => setMergeToId(e.target.value)}
                    >
                      <option value="">不合併（刪除日記）</option>
                      {categories
                        .filter((x) => x.id !== c.id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            合併到：{x.name}
                          </option>
                        ))}
                    </select>
                    <button
                      className="btn btn-primary h-8 px-3"
                      onClick={commitDelete}
                      type="button"
                      title="Confirm"
                    >
                      確認刪除
                    </button>
                    <button
                      className="btn btn-secondary h-8 px-3"
                      onClick={cancelDelete}
                      type="button"
                      title="Cancel"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
