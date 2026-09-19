"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tripFromHash } from "@/lib/share";
import { Trip, TRANSPORT_LABELS } from "@/types/trip";
import { formatCNDate, formatMoney } from "@/lib/utils";
import { estimatedCost } from "@/lib/trip";
import { upsertTrip } from "@/lib/storage";
import { uid } from "@/lib/utils";

export default function SharePage() {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [cloned, setCloned] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = tripFromHash(window.location.hash);
    queueMicrotask(() => {
      if (cancelled) return;
      if (t) setTrip(t);
      else setInvalid(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleClone() {
    if (!trip) return;
    // Give cloned trip fresh ids so it becomes the user's own copy.
    const copy: Trip = structuredClone(trip);
    copy.id = uid();
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    upsertTrip(copy);
    setCloned(true);
    setTimeout(() => {
      router.push("/");
    }, 800);
  }

  if (invalid) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl">😢</div>
          <p className="mt-4 text-slate-600">分享链接无效或已损坏</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700"
          >
            回到首页，自己创建一份
          </Link>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-400">
        加载中…
      </main>
    );
  }

  const cost = estimatedCost(trip);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              朋友分享的攻略
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-800">
              🧳 {trip.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              📍 {trip.destination} · {TRANSPORT_LABELS[trip.transport]} · 👥{" "}
              {trip.travelers} 人
            </p>
            <p className="mt-1 text-sm text-slate-500">
              📅 {formatCNDate(trip.startDate)} ~ {formatCNDate(trip.endDate)}（共{" "}
              {trip.days.length} 天）
              {cost > 0 && <> · 🧾 预计 {formatMoney(cost)}</>}
            </p>
            {trip.notes && (
              <p className="mt-2 text-sm text-slate-400">📝 {trip.notes}</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {trip.days.map((day, i) => (
            <div key={day.date}>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-medium text-white">
                  Day {i + 1}
                </span>
                <span className="text-sm text-slate-400">
                  {formatCNDate(day.date)}
                </span>
              </div>
              <ul className="mt-3 space-y-2 border-l-2 border-indigo-100 pl-4">
                {day.activities.length === 0 ? (
                  <li className="text-sm italic text-slate-400">
                    （自由探索）
                  </li>
                ) : (
                  day.activities.map((a) => (
                    <li key={a.id} className="text-sm">
                      <span className="font-medium text-slate-700">
                        {a.startTime && (
                          <span className="mr-2 text-indigo-500">
                            {a.startTime}
                          </span>
                        )}
                        {a.title}
                      </span>
                      {a.location && (
                        <span className="text-slate-400"> @ {a.location}</span>
                      )}
                      {a.cost != null && a.cost > 0 && (
                        <span className="ml-2 text-emerald-600">
                          {formatMoney(a.cost)}
                        </span>
                      )}
                      {a.notes && (
                        <p className="ml-5 text-xs text-slate-400">{a.notes}</p>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <button
            onClick={handleClone}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            {cloned ? "✅ 已保存，即将跳转…" : "📥 克隆这份攻略（可再编辑）"}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            ✨ 创建我自己的攻略
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        由开源项目 Travel Planner 生成 · 数据保存在本地，隐私友好
      </p>
    </main>
  );
}
