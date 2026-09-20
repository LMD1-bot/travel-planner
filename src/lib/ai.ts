"use client";

import {
  Activity,
  ActivityType,
  DayPlan,
  DEFAULT_PROFILE,
  TravelerProfile,
  Trip,
} from "@/types/trip";
import { createTrip } from "@/lib/trip";
import { addDaysISO, dateRange, todayISO, uid } from "@/lib/utils";
import { analyzeTrip } from "@/lib/experience";

export interface AiRequest {
  prompt: string;
  apiKey: string;
  baseUrl?: string; // OpenAI-compatible endpoint
  model?: string;
  profile?: TravelerProfile;
}

/**
 * The heart of the product: a human-experience-first planning brief.
 * Not a sightseeing lister — an experience designer that respects
 * energy curves, emotional pacing and individual care needs.
 */
export const AI_SYSTEM_PROMPT = `你是一位「以人为本」的行程体验设计师，不是景点罗列器。
目标是让这份行程在体力、情绪、光线与节奏上都舒服，而不是把景点塞满。

【体力曲线】
- 08:00-11:00 精力高峰：安排当天最需要体力的活动
- 11:00-13:00 平稳：常规游览或午餐
- 13:00-15:00 第二个低谷：只安排室内、有座位、可静态欣赏的内容
- 15:00-18:00 回升：户外与体验类
- 18:00 之后 低体力高情绪：晚餐、夜景、散步

【峰值体验】
- 每天只设计 1 个「记忆锚点」（type=peak），放在体力与光线最好的时段；风景类放在日落前约 1.5 小时。
- 峰值前不赶路，峰值后不排长队。

【节奏与缓冲】
- 相邻活动之间必须留够时间：前一活动时长 + 至少 20 分钟路程与缓冲。
- 每天至少包含 2 个 type=meal 的用餐节点；当天负荷偏重时必须含 1 个 type=rest 休息块（45-60 分钟）。

【个体关怀（逐条落实，写进 notes）】
- 生理期当天：负荷约为平时的 6 折。避免长时间徒步、暴晒、久站；安排就近、可随时返回住宿点的内容；提醒带保温杯/暖贴。
- 需要频繁洗手间：每 2 小时左右安排一个可预期停靠点（景区入口/商场/连锁咖啡店/用餐）。
- 夜晚安全优先：不安排 21:00 之后的户外活动；若安排夜景，选明亮、人流多的区域，并提醒 22:00 前回到住宿地。
- 不跳餐：两餐间隔不超过 5 小时；跨度大时安排小食。
- 避免决策疲劳：不要排满，每天留出至少一段自由时间。

【输出要求】
只输出严格 JSON（不要 markdown 代码块、不要任何解释文字）：
{
  "name": "行程名称",
  "destination": "目的地",
  "designNote": "一句话说明设计思路（如何照顾体力与情绪）",
  "days": [
    {
      "theme": "当天主题，如 海边慢日",
      "peak": "当天峰值体验，如 17:30 环岛路看日落",
      "activities": [
        {
          "time": "HH:mm",
          "durationMin": 90,
          "title": "活动名称",
          "location": "地点",
          "cost": 0,
          "type": "sight|meal|rest|transit|peak|shop|stay",
          "notes": "实用小贴士（含关怀提示）"
        }
      ]
    }
  ],
  "careNotes": ["针对本次旅行者画像的关怀提醒，3-6 条"]
}
cost 为人民币整数估算，免费填 0；每天活动（含用餐与休息）共 3-6 条；时间用 24 小时制。`;

function profileBrief(p: TravelerProfile): string {
  const lines: string[] = [];
  lines.push(
    `同行构成：成人 ${p.adults} 人` +
      (p.children ? `、儿童 ${p.children} 人` : "") +
      (p.elders ? `、长辈 ${p.elders} 人` : "")
  );
  lines.push(
    `节奏偏好：${{ relaxed: "慢节奏，每天少量景点", balanced: "张弛有度", packed: "尽量多玩" }[p.pace]}`
  );
  lines.push(
    `体力水平：${{ low: "一般，需要多休息", medium: "中等", high: "好，可以长时间步行" }[p.physical]}`
  );
  if (p.periodDays.length > 0) {
    lines.push(
      `生理期：第 ${p.periodDays.join("、")} 天（这些天必须显著降低强度，并落实生理期关怀）`
    );
  }
  if (p.restroomSensitive) lines.push("洗手间可达性：优先，需要可预期的停靠点");
  if (p.eveningSafety) lines.push("夜晚安全优先：避免夜间户外与偏远区域，需早回住宿地");
  if (p.diet) lines.push(`饮食/忌口：${p.diet}`);
  if (p.mustSee) lines.push(`一定要去：${p.mustSee}`);
  if (p.avoid) lines.push(`尽量避免：${p.avoid}`);
  return lines.join("\n");
}

export function buildUserMessage(req: AiRequest): string {
  const prof = req.profile ?? DEFAULT_PROFILE;
  return `【旅行者画像】\n${profileBrief(prof)}\n\n【需求描述】\n${req.prompt}`;
}

interface RawActivity {
  time?: string;
  durationMin?: number;
  title?: string;
  location?: string;
  cost?: number;
  type?: string;
  notes?: string;
}

interface RawDay {
  theme?: string;
  peak?: string;
  activities?: RawActivity[];
}

const VALID_TYPES: ActivityType[] = [
  "sight",
  "meal",
  "rest",
  "transit",
  "peak",
  "shop",
  "stay",
];

function normType(t?: string): ActivityType {
  return VALID_TYPES.includes(t as ActivityType) ? (t as ActivityType) : "sight";
}

/** Call an OpenAI-compatible chat API and turn the reply into a Trip. */
export async function generateTripWithAI(req: AiRequest): Promise<Trip> {
  const baseUrl = (req.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = req.model || "gpt-4o-mini";
  const profile = req.profile ?? DEFAULT_PROFILE;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(req) },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI 请求失败 (${res.status})：${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(content);

  const daysArr: RawDay[] = parsed.days ?? [];
  const start = todayISO();
  const dayCount = Math.max(1, daysArr.length);
  const end = addDaysISO(start, dayCount - 1);

  const trip = createTrip({
    name: parsed.name || "AI 生成的行程",
    destination: parsed.destination || "未知目的地",
    startDate: start,
    endDate: end,
    travelers: Math.max(1, profile.adults + profile.children + profile.elders),
    transport: "other",
    notes: parsed.designNote || "由 AI 生成，可自由调整",
  });

  const dates = dateRange(start, end);
  const days: DayPlan[] = dates.map((date, i) => {
    const raw = daysArr[i];
    return {
      date,
      theme: raw?.theme,
      peak: raw?.peak,
      activities: (raw?.activities ?? []).map(
        (a): Activity => ({
          id: uid(),
          title: a.title ?? "活动",
          location: a.location,
          startTime: a.time,
          notes: a.notes,
          cost: a.cost,
          type: normType(a.type),
          durationMin: a.durationMin,
        })
      ),
    };
  });

  trip.days = days;
  trip.profile = profile;
  trip.designNote = parsed.designNote;
  trip.careNotes = Array.isArray(parsed.careNotes)
    ? parsed.careNotes.filter((x: unknown): x is string => typeof x === "string")
    : [];

  // Deterministic verification: our own experience model reviews the LLM output.
  const issues = analyzeTrip(trip, profile);
  const problems = issues.filter((x) => x.level !== "info");
  if (problems.length > 0) {
    trip.careNotes = [
      ...(trip.careNotes ?? []),
      `系统复核：以下 ${problems.length} 处节奏问题建议手动微调 —— ` +
        problems.map((x) => `Day ${x.day}·${x.title}`).join("；"),
    ];
  }

  return trip;
}