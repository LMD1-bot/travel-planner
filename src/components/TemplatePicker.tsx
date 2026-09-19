"use client";

import { TEMPLATES, instantiateTemplate } from "@/lib/templates";
import { Trip } from "@/types/trip";

interface Props {
  onCreated: (trip: Trip) => void;
}

export default function TemplatePicker({ onCreated }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        📚 从模板开始
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        不知道去哪？挑一个现成攻略一键套用，再按自己的喜好微调。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              const trip = instantiateTemplate(t.id);
              if (trip) onCreated(trip);
            }}
            className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.emoji}</span>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 group-hover:text-indigo-600">
                  {t.title}
                </p>
                <p className="text-xs text-slate-400">
                  {t.city} · {t.days} 天
                </p>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-500">
              {t.summary}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
