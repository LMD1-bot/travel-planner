"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NewTripForm from "@/components/NewTripForm";
import TripCard from "@/components/TripCard";
import TripDetail from "@/components/TripDetail";
import {
  deleteTrip,
  exportTrips,
  importTrips,
  loadTrips,
  upsertTrip,
} from "@/lib/storage";
import { Trip } from "@/types/trip";

export default function Home() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    // Read from localStorage on the client only, after mount.
    const loaded = loadTrips().sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
    // Defer state updates to avoid synchronous setState within the effect body.
    queueMicrotask(() => {
      if (cancelled) return;
      setTrips(loaded);
      setSelectedId(loaded[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = trips?.find((t) => t.id === selectedId) ?? null;

  const handleCreated = useCallback((trip: Trip) => {
    const next = upsertTrip(trip);
    setTrips(next);
    setSelectedId(trip.id);
    setCreating(false);
  }, []);

  const handleChange = useCallback((trip: Trip) => {
    setTrips(upsertTrip(trip));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm("确定删除这个行程吗？此操作不可撤销。")) return;
      const next = deleteTrip(id);
      setTrips(next);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
    },
    [selectedId]
  );

  async function handleImport(file: File) {
    try {
      const n = await importTrips(file);
      const next = loadTrips();
      setTrips(next);
      alert(`成功导入 ${n} 个行程`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "导入失败");
    }
  }

  if (trips === null) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-400">
        加载中…
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            🧳 Travel Planner
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            开源的出游攻略助手 · 数据保存在本地浏览器 · 一键导出 Markdown 攻略
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportTrips(trips)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            title="备份全部行程为 JSON"
          >
            ⬇️ 备份
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            title="从 JSON 恢复行程"
          >
            ⬆️ 恢复
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => setCreating((v) => !v)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            {creating ? "收起" : "＋ 新建行程"}
          </button>
        </div>
      </header>

      {/* Create form */}
      {creating && (
        <div className="mb-6">
          <NewTripForm
            onCreated={handleCreated}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {/* Content */}
      {trips.length === 0 && !creating ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-3">
            {trips.map((t) => (
              <TripCard
                key={t.id}
                trip={t}
                selected={t.id === selectedId}
                onSelect={() => setSelectedId(t.id)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </aside>
          <section>
            {selected ? (
              <TripDetail trip={selected} onChange={handleChange} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
                选择左侧行程查看详情
              </p>
            )}
          </section>
        </div>
      )}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        MIT License · 数据仅存储在你的浏览器中，不上传任何服务器
      </footer>
    </main>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 py-20 text-center">
      <div className="text-6xl">🗺️</div>
      <h2 className="mt-4 text-xl font-semibold text-slate-700">
        开始规划你的第一次旅行
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        创建行程、安排每日活动、管理出行清单，最后一键导出精美的 Markdown
        攻略分享给旅伴。
      </p>
      <button
        onClick={onCreate}
        className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        ✨ 新建行程
      </button>
    </div>
  );
}
