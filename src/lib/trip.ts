import {
  Activity,
  ChecklistItem,
  DayPlan,
  DEFAULT_CHECKLIST,
  TRANSPORT_LABELS,
  Trip,
} from "@/types/trip";
import { dateRange, formatCNDate, formatMoney, uid } from "@/lib/utils";

export interface NewTripInput {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: number;
  transport: Trip["transport"];
  notes?: string;
}

export function createTrip(input: NewTripInput): Trip {
  const now = new Date().toISOString();
  const days: DayPlan[] = dateRange(input.startDate, input.endDate).map(
    (date) => ({ date, activities: [] })
  );
  const checklist: ChecklistItem[] = DEFAULT_CHECKLIST.map((c) => ({
    ...c,
    id: uid(),
  }));
  return {
    id: uid(),
    ...input,
    days,
    checklist,
    createdAt: now,
    updatedAt: now,
  };
}

export function createActivity(partial: Partial<Activity> = {}): Activity {
  return {
    id: uid(),
    title: partial.title ?? "",
    location: partial.location,
    startTime: partial.startTime,
    endTime: partial.endTime,
    notes: partial.notes,
    cost: partial.cost,
  };
}

/** Total estimated cost across all activities. */
export function estimatedCost(trip: Trip): number {
  return trip.days
    .flatMap((d) => d.activities)
    .reduce((sum, a) => sum + (a.cost ?? 0), 0);
}

/** Render a trip as a Markdown 攻略, ready to copy or download. */
export function tripToMarkdown(trip: Trip): string {
  const lines: string[] = [];
  lines.push(`# ${trip.name}`);
  lines.push("");
  lines.push(`- 📍 目的地：${trip.destination}`);
  lines.push(
    `- 📅 时间：${formatCNDate(trip.startDate)} ~ ${formatCNDate(trip.endDate)}（共 ${trip.days.length} 天）`
  );
  lines.push(`- 👥 人数：${trip.travelers} 人`);
  lines.push(`- 🚦 交通：${TRANSPORT_LABELS[trip.transport]}`);
  if (trip.budget != null) lines.push(`- 💰 预算：${formatMoney(trip.budget)}`);
  const cost = estimatedCost(trip);
  if (cost > 0) lines.push(`- 🧾 预计花费：${formatMoney(cost)}`);
  if (trip.notes) lines.push(`- 📝 备注：${trip.notes}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  trip.days.forEach((day, i) => {
    lines.push(`## Day ${i + 1} · ${formatCNDate(day.date)}`);
    lines.push("");
    if (day.activities.length === 0) {
      lines.push("_（暂无安排，自由探索）_");
    } else {
      for (const a of day.activities) {
        const time =
          a.startTime || a.endTime
            ? `\`${a.startTime ?? "??"} - ${a.endTime ?? "??"}\` `
            : "";
        const loc = a.location ? ` @ ${a.location}` : "";
        const costStr = a.cost != null ? `（约 ${formatMoney(a.cost)}）` : "";
        lines.push(`- ${time}**${a.title}**${loc}${costStr}`);
        if (a.notes) lines.push(`  - ${a.notes}`);
      }
    }
    lines.push("");
  });

  const pending = trip.checklist.filter((c) => !c.done);
  if (pending.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## 🎒 待打包清单");
    lines.push("");
    for (const c of trip.checklist) {
      lines.push(`- [${c.done ? "x" : " "}] ${c.label}`);
    }
    lines.push("");
  }

  lines.push("> 由 [Travel Planner](https://github.com/) 生成 · 祝你旅途愉快！");
  return lines.join("\n");
}

/** Download the Markdown itinerary as a .md file. */
export function downloadMarkdown(trip: Trip): void {
  const md = tripToMarkdown(trip);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trip.name.replace(/[\\/:*?"<>|]/g, "_")}-攻略.md`;
  a.click();
  URL.revokeObjectURL(url);
}