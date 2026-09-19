"use client";

import { TRANSPORT_LABELS, Trip } from "@/types/trip";
import { formatCNDate, formatMoney, tripDuration } from "@/lib/utils";
import { estimatedCost } from "@/lib/trip";

interface Props {
  trip: Trip;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function TripCard({ trip, selected, onSelect, onDelete }: Props) {
  const cost = estimatedCost(trip);
  const doneCount = trip.checklist.filter((c) => c.done).length;
  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl border p-5 transition hover:shadow-md ${
        selected
          ? "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-300"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-800">{trip.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="删除行程"
          aria-label="删除行程"
        >
          ✕
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">📍 {trip.destination}</p>
      <p className="mt-1 text-sm text-slate-500">
        📅 {formatCNDate(trip.startDate)} · 共{" "}
        {tripDuration(trip.startDate, trip.endDate)} 天
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-0.5">
          {TRANSPORT_LABELS[trip.transport]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">
          👥 {trip.travelers} 人
        </span>
        {cost > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
            {formatMoney(cost)}
          </span>
        )}
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
          清单 {doneCount}/{trip.checklist.length}
        </span>
      </div>
    </div>
  );
}