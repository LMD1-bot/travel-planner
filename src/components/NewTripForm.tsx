"use client";

import { useState } from "react";
import { TRANSPORT_LABELS, TransportMode } from "@/types/trip";
import { addDaysISO, todayISO } from "@/lib/utils";
import { createTrip } from "@/lib/trip";
import { Trip } from "@/types/trip";

interface Props {
  onCreated: (trip: Trip) => void;
  onCancel: () => void;
}

export default function NewTripForm({ onCreated, onCancel }: Props) {
  const today = todayISO();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDaysISO(today, 2));
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState<string>("");
  const [transport, setTransport] = useState<TransportMode>("train");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("请填写行程名称");
    if (!destination.trim()) return setError("请填写目的地");
    if (endDate < startDate) return setError("结束日期不能早于开始日期");
    const trip = createTrip({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      travelers: Math.max(1, travelers),
      budget: budget ? Number(budget) : undefined,
      transport,
      notes: notes.trim() || undefined,
    });
    onCreated(trip);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        ✨ 新建行程
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">行程名称 *</span>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            placeholder="例：五一厦门之旅"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">目的地 *</span>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            placeholder="例：福建 · 厦门"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">开始日期</span>
          <input
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">结束日期</span>
          <input
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">出行人数</span>
          <input
            type="number"
            min={1}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value) || 1)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">预算（元，可选）</span>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            placeholder="例：3000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-slate-600">主要交通方式</span>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            value={transport}
            onChange={(e) => setTransport(e.target.value as TransportMode)}
          >
            {Object.entries(TRANSPORT_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-slate-600">备注（可选）</span>
          <textarea
            rows={2}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
            placeholder="例：想看海、吃海鲜，避开人多的景点"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          创建行程
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}