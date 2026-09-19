"use client";

import { Trip, DayPlan } from "@/types/trip";
import { createTrip } from "@/lib/trip";
import { addDaysISO, dateRange, todayISO, uid } from "@/lib/utils";
import { Activity } from "@/types/trip";

export interface AiRequest {
  prompt: string;
  apiKey: string;
  baseUrl?: string; // OpenAI-compatible endpoint
  model?: string;
}

const SYS = `你是一个专业的旅行规划助手。用户会描述旅行需求，你只输出严格的 JSON（不要 markdown 代码块、不要多余解释），结构如下：
{
  "name": "行程名称",
  "destination": "目的地",
  "days": [
    { "activities": [ { "time": "09:00", "title": "活动名", "location": "地点", "cost": 100, "notes": "小贴士" } ] }
  ]
}
要求：每天 3-6 个活动，时间从早到晚，cost 为人民币估算（免费填 0），notes 给实用贴士。`;

/** Call an OpenAI-compatible chat API to generate a structured trip. */
export async function generateTripWithAI(req: AiRequest): Promise<Trip> {
  const baseUrl = (req.baseUrl || "https://api.openai.com/v1").replace(
    /\/+$/,
    ""
  );
  const model = req.model || "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: req.prompt },
      ],
      temperature: 0.7,
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

  // Build a Trip from AI output
  const daysArr: { activities?: { time?: string; title?: string; location?: string; cost?: number; notes?: string }[] }[] =
    parsed.days ?? [];
  const start = todayISO();
  const dayCount = Math.max(1, daysArr.length);
  const end = addDaysISO(start, dayCount - 1);

  const trip = createTrip({
    name: parsed.name || "AI 生成的行程",
    destination: parsed.destination || "未知目的地",
    startDate: start,
    endDate: end,
    travelers: 2,
    transport: "other",
    notes: "由 AI 生成，可自由调整",
  });

  const dates = dateRange(start, end);
  const days: DayPlan[] = dates.map((date, i) => ({
    date,
    activities: (daysArr[i]?.activities ?? []).map(
      (a): Activity => ({
        id: uid(),
        title: a.title ?? "活动",
        location: a.location,
        startTime: a.time,
        notes: a.notes,
        cost: a.cost,
      })
    ),
  }));
  trip.days = days;
  return trip;
}
