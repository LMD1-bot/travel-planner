"use client";

import { useState } from "react";
import {
  Activity,
  ACTIVITY_TYPE_LABELS,
  ActivityType,
  INTENSITY_LABELS,
  TRANSPORT_LABELS,
  Trip,
} from "@/types/trip";
import { formatCNDate, formatMoney, uid } from "@/lib/utils";
import { createActivity, downloadMarkdown, estimatedCost } from "@/lib/trip";
import { buildShareUrl } from "@/lib/share";
import { downloadShareImage } from "@/lib/shareImage";
import { tripHealth } from "@/lib/experience";

interface Props {
  trip: Trip;
  onChange: (trip: Trip) => void;
}

export default function TripDetail({ trip, onChange }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [showChecklist, setShowChecklist] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);

  const day = trip.days[activeDay];
  const cost = estimatedCost(trip);

  // Experience engine: deterministic health check (works with or without AI)
  const health = tripHealth(trip);
  const dayHealth = health.perDay[activeDay];
  const dayIssues = health.issues.filter(
    (x) => x.day === activeDay + 1 && x.level !== "info"
  );

  // P3: budget health
  const budgetPct =
    trip.budget && trip.budget > 0
      ? Math.min(100, Math.round((cost / trip.budget) * 100))
      : null;

  function update(mutator: (t: Trip) => void) {
    const next: Trip = structuredClone(trip);
    mutator(next);
    next.updatedAt = new Date().toISOString();
    onChange(next);
  }

  function addActivity() {
    update((t) => {
      t.days[activeDay].activities.push(
        createActivity({ title: "新活动", startTime: "09:00" })
      );
    });
  }

  function patchActivity(id: string, patch: Partial<Activity>) {
    update((t) => {
      const a = t.days[activeDay].activities.find((x) => x.id === id);
      if (a) Object.assign(a, patch);
    });
  }

  function removeActivity(id: string) {
    update((t) => {
      t.days[activeDay].activities = t.days[activeDay].activities.filter(
        (x) => x.id !== id
      );
    });
  }

  function moveActivity(id: string, dir: -1 | 1) {
    update((t) => {
      const list = t.days[activeDay].activities;
      const i = list.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });
  }

  function toggleCheck(id: string) {
    update((t) => {
      const c = t.checklist.find((x) => x.id === id);
      if (c) c.done = !c.done;
    });
  }

  function addCheckItem(label: string) {
    if (!label.trim()) return;
    update((t) => {
      t.checklist.push({
        id: uid(),
        label: label.trim(),
        done: false,
        category: "其他",
      });
    });
  }

  async function copyMarkdown() {
    const { tripToMarkdown } = await import("@/lib/trip");
    await navigator.clipboard.writeText(tripToMarkdown(trip));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{trip.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            📍 {trip.destination} · {TRANSPORT_LABELS[trip.transport]} · 👥{" "}
            {trip.travelers} 人
            {trip.budget != null && <> · 💰 预算 {formatMoney(trip.budget)}</>}
            {cost > 0 && <> · 🧾 预计 {formatMoney(cost)}</>}
          </p>
          {trip.notes && (
            <p className="mt-1 text-sm text-slate-400">📝 {trip.notes}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyMarkdown}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            {copied ? "✅ 已复制" : "📋 复制攻略"}
          </button>
          <button
            onClick={async () => {
              const url = buildShareUrl(trip);
              await navigator.clipboard.writeText(url);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 1500);
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
            title="复制只读分享链接，朋友打开即可查看并克隆"
          >
            {linkCopied ? "✅ 链接已复制" : "🔗 分享链接"}
          </button>
          <button
            onClick={async () => {
              setImgBusy(true);
              try {
                await downloadShareImage(trip);
              } finally {
                setImgBusy(false);
              }
            }}
            disabled={imgBusy}
            className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
            title="生成一张精美的分享图片，适合小红书/微信"
          >
            {imgBusy ? "生成中…" : "🖼️ 分享图片"}
          </button>
          <button
            onClick={() => downloadMarkdown(trip)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            ⬇️ Markdown
          </button>
        </div>
      </div>

      {/* P3: budget health bar */}
      {budgetPct != null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>预算健康度</span>
            <span
              className={
                budgetPct > 100
                  ? "font-medium text-red-500"
                  : budgetPct > 80
                  ? "text-amber-500"
                  : "text-emerald-600"
              }
            >
              {formatMoney(cost)} / {formatMoney(trip.budget)}（{budgetPct}%）
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPct > 100
                  ? "bg-red-500"
                  : budgetPct > 80
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          {cost > (trip.budget ?? 0) && (
            <p className="mt-1 text-xs text-red-500">
              ⚠️ 预计花费已超出预算，建议精简活动或上调预算
            </p>
          )}
        </div>
      )}

      {/* Experience design note + care reminders from AI */}
      {(trip.designNote || (trip.careNotes?.length ?? 0) > 0) && (
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <p className="text-xs font-semibold text-violet-700">
            🧠 体验设计说明
          </p>
          {trip.designNote && (
            <p className="mt-1 text-sm text-slate-600">{trip.designNote}</p>
          )}
          {(trip.careNotes?.length ?? 0) > 0 && (
            <ul className="mt-2 space-y-1">
              {(trip.careNotes ?? []).map((c, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-600">
                  <span className="text-violet-400">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Deterministic care findings for the whole trip */}
      {health.issues.length > 0 && (
        <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <summary className="cursor-pointer text-xs font-semibold text-slate-600">
             体验体检：{health.issues.length} 条可优化项（{health.danger} 需注意 /{" "}
            {health.warn} 建议 / {health.info} 提示）
          </summary>
          <ul className="mt-3 space-y-3">
            {health.issues.map((it, i) => (
              <li key={i} className="text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 ${
                      it.level === "danger"
                        ? "bg-red-100 text-red-700"
                        : it.level === "warn"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {it.level === "danger"
                      ? "需注意"
                      : it.level === "warn"
                      ? "建议"
                      : "提示"}
                  </span>
                  <span className="font-medium text-slate-700">
                    {it.day ? `Day ${it.day} · ` : ""}
                    {it.title}
                  </span>
                </div>
                <p className="mt-1 pl-1 text-slate-500">{it.detail}</p>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {trip.days.map((d, i) => (
          <button
            key={d.date}
            onClick={() => {
              setActiveDay(i);
              setShowChecklist(false);
            }}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              !showChecklist && activeDay === i
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Day {i + 1}
          </button>
        ))}
        <button
          onClick={() => setShowChecklist(true)}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            showChecklist
              ? "bg-amber-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🎒 出行清单（{trip.checklist.filter((c) => c.done).length}/
          {trip.checklist.length}）
        </button>
      </div>

      {/* Checklist view */}
      {showChecklist ? (
        <ChecklistView
          trip={trip}
          onToggle={toggleCheck}
          onAdd={addCheckItem}
        />
      ) : (
        day && (
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">
                {formatCNDate(day.date)}
                {day.theme && (
                  <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                    {day.theme}
                  </span>
                )}
              </p>
              {dayHealth && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    dayHealth.intensity === "intense"
                      ? "bg-red-50 text-red-600"
                      : dayHealth.intensity === "medium"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                  title={`负荷 ${dayHealth.load.toFixed(1)} / 舒适上限 ${
                    dayHealth.cap
                  }`}
                >
                  {INTENSITY_LABELS[dayHealth.intensity]} · 负荷{" "}
                  {dayHealth.load.toFixed(1)}/{dayHealth.cap}
                </span>
              )}
            </div>

            {(day.peak || day.activities.some((a) => a.type === "peak")) && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⭐ 今日峰值体验：
                {day.peak ||
                  day.activities.find((a) => a.type === "peak")?.title}
              </p>
            )}

            {dayIssues.length > 0 && (
              <ul className="mb-3 space-y-1">
                {dayIssues.map((it, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-500">
                    <span>{it.level === "danger" ? "🔴" : "🟡"}</span>
                    <span>
                      <span className="font-medium text-slate-600">
                        {it.title}
                      </span>
                      ：{it.detail}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {day.activities.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
                这一天还没有安排，点击下方按钮添加活动 👇
              </p>
            )}
            <ul className="space-y-3">
              {day.activities.map((a, i) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4"
                >
                  {/* Row 1: times + type */}
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      className="w-[92px] flex-shrink-0 rounded border border-slate-300 px-1.5 py-2 text-sm sm:py-1"
                      value={a.startTime ?? ""}
                      onChange={(e) =>
                        patchActivity(a.id, { startTime: e.target.value })
                      }
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="time"
                      className="w-[92px] flex-shrink-0 rounded border border-slate-300 px-1.5 py-2 text-sm sm:py-1"
                      value={a.endTime ?? ""}
                      onChange={(e) =>
                        patchActivity(a.id, { endTime: e.target.value })
                      }
                    />
                    <select
                      className="ml-auto rounded border border-slate-300 px-1 py-2 text-xs text-slate-600 sm:py-1"
                      value={a.type ?? "sight"}
                      onChange={(e) =>
                        patchActivity(a.id, {
                          type: e.target.value as ActivityType,
                        })
                      }
                      title="活动类型：影响体力负荷与体验体检"
                    >
                      {(Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).map(
                        (t) => (
                          <option key={t} value={t}>
                            {ACTIVITY_TYPE_LABELS[t]}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Row 2: title full width */}
                  <input
                    className="mt-2 w-full rounded border border-transparent bg-transparent px-2 py-2 text-sm font-medium outline-none focus:border-indigo-300 focus:bg-white sm:py-1"
                    value={a.title}
                    onChange={(e) =>
                      patchActivity(a.id, { title: e.target.value })
                    }
                    placeholder="活动名称"
                  />

                  {/* Row 3: cost + actions */}
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded border border-slate-300 px-2 py-2 text-sm sm:py-1"
                      value={a.cost ?? ""}
                      placeholder="费用 ¥"
                      onChange={(e) =>
                        patchActivity(a.id, {
                          cost: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                    <div className="ml-auto flex gap-1">
                      <IconBtn
                        title="上移"
                        onClick={() => moveActivity(a.id, -1)}
                        disabled={i === 0}
                      >
                        ↑
                      </IconBtn>
                      <IconBtn
                        title="下移"
                        onClick={() => moveActivity(a.id, 1)}
                        disabled={i === day.activities.length - 1}
                      >
                        ↓
                      </IconBtn>
                      <IconBtn
                        title="删除"
                        danger
                        onClick={() => removeActivity(a.id)}
                      >
                        ✕
                      </IconBtn>
                    </div>
                  </div>
                  {/* Row 4: location + notes — stacked on mobile */}
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      className="flex-1 rounded border border-transparent bg-transparent px-2 py-2 text-sm text-slate-500 outline-none focus:border-indigo-300 focus:bg-white sm:py-1"
                      value={a.location ?? ""}
                      placeholder="📍 地点（可选）"
                      onChange={(e) =>
                        patchActivity(a.id, { location: e.target.value })
                      }
                    />
                    <input
                      className="flex-1 rounded border border-transparent bg-transparent px-2 py-2 text-sm text-slate-500 outline-none focus:border-indigo-300 focus:bg-white sm:py-1"
                      value={a.notes ?? ""}
                      placeholder="📝 备注（可选）"
                      onChange={(e) =>
                        patchActivity(a.id, { notes: e.target.value })
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={addActivity}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-indigo-300 py-3 text-sm font-medium text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
            >
              ＋ 添加活动
            </button>
          </div>
        )
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded px-2.5 py-2 text-sm transition disabled:opacity-30 sm:py-1 sm:text-xs ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-500"
          : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function ChecklistView({
  trip,
  onToggle,
  onAdd,
}: {
  trip: Trip;
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
}) {
  const [text, setText] = useState("");
  const groups = Array.from(new Set(trip.checklist.map((c) => c.category)));
  return (
    <div className="mt-4">
      {groups.map((g) => (
        <div key={g} className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {g}
          </p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {trip.checklist
              .filter((c) => c.category === g)
              .map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={() => onToggle(c.id)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <span
                      className={
                        c.done ? "text-slate-300 line-through" : "text-slate-700"
                      }
                    >
                      {c.label}
                    </span>
                  </label>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-400"
          placeholder="添加自定义物品，回车确认"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd(text);
              setText("");
            }
          }}
        />
        <button
          onClick={() => {
            onAdd(text);
            setText("");
          }}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          添加
        </button>
      </div>
    </div>
  );
}