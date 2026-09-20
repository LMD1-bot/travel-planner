"use client";

import { useState } from "react";
import { generateTripWithAI } from "@/lib/ai";
import {
  DEFAULT_PROFILE,
  PACE_LABELS,
  PHYSICAL_LABELS,
  TravelerProfile,
  Trip,
} from "@/types/trip";

interface Props {
  onCreated: (trip: Trip) => void;
}

export default function AiGenerateForm({ onCreated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [dayCount, setDayCount] = useState(3);
  const [showCare, setShowCare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function patch(p: Partial<TravelerProfile>) {
    setProfile((v) => ({ ...v, ...p }));
  }

  function togglePeriodDay(d: number) {
    setProfile((v) => ({
      ...v,
      periodDays: v.periodDays.includes(d)
        ? v.periodDays.filter((x) => x !== d)
        : [...v.periodDays, d].sort((a, b) => a - b),
    }));
  }

  async function handleGenerate() {
    if (!prompt.trim()) return setError("请描述你的旅行需求");
    if (!apiKey.trim()) return setError("请填入 API Key（仅保存在本地浏览器）");
    setError("");
    setLoading(true);
    try {
      const trip = await generateTripWithAI({
        prompt: prompt.trim(),
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || undefined,
        model: model.trim() || undefined,
        profile,
      });
      onCreated(trip);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  const num = "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400";
  const lbl = "flex flex-col gap-1 text-xs text-slate-500";

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">🤖 AI 生成攻略</h2>
      <p className="mb-4 text-sm text-slate-500">
        按「人的体力与情绪」来排行程：先填旅行者画像，AI 会据此安排节奏、休息与峰值体验。
      </p>      <textarea
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
        placeholder="例：五一去厦门玩3天，2个人，预算3000，喜欢海边和美食，想慢一点"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="mt-4 rounded-xl border border-violet-200 bg-white/70 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-600">
          👥 旅行者画像（决定行程节奏与关怀方式）
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className={lbl}>
            <span>成人</span>
            <input type="number" min={0} className={num} value={profile.adults}
              onChange={(e) => patch({ adults: Number(e.target.value) || 0 })} />
          </label>
          <label className={lbl}>
            <span>儿童</span>
            <input type="number" min={0} className={num} value={profile.children}
              onChange={(e) => patch({ children: Number(e.target.value) || 0 })} />
          </label>
          <label className={lbl}>
            <span>长辈</span>
            <input type="number" min={0} className={num} value={profile.elders}
              onChange={(e) => patch({ elders: Number(e.target.value) || 0 })} />
          </label>
          <label className={lbl}>
            <span>总天数</span>
            <input type="number" min={1} max={15} className={num} value={dayCount}
              onChange={(e) => setDayCount(Math.max(1, Number(e.target.value) || 1))} />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className={lbl}>
            <span>节奏偏好</span>
            <select className={num} value={profile.pace}
              onChange={(e) => patch({ pace: e.target.value as TravelerProfile["pace"] })}>
              {Object.entries(PACE_LABELS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label className={lbl}>
            <span>体力水平</span>
            <select className={num} value={profile.physical}
              onChange={(e) => patch({ physical: e.target.value as TravelerProfile["physical"] })}>
              {Object.entries(PHYSICAL_LABELS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
        </div>

        <button onClick={() => setShowCare((v) => !v)}
          className="mt-3 text-xs text-violet-600 underline">
          {showCare ? "收起关怀设置" : "＋ 展开关怀设置（生理期 / 洗手间 / 夜晚安全 / 忌口）"}
        </button>
        {showCare && (
          <div className="mt-3 space-y-3 border-t border-violet-100 pt-3">
            <div>
              <p className="text-xs text-slate-500">
                生理期日（点选对应天数，当天会自动降到约 6 折强度）
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => {
                  const on = profile.periodDays.includes(d);
                  return (
                    <button key={d} onClick={() => togglePeriodDay(d)}
                      className={`h-8 w-8 rounded-full text-xs transition ${
                        on ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      D{d}
                    </button>
                  );
                })}
              </div>
              {profile.periodDays.length > 0 && (
                <p className="mt-1 text-xs text-rose-500">
                  已标记：第 {profile.periodDays.join("、")} 天为生理期，将自动降低强度并加入关怀提醒。
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-violet-500"
                  checked={profile.restroomSensitive}
                  onChange={(e) => patch({ restroomSensitive: e.target.checked })} />
                洗手间可达性优先
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-violet-500"
                  checked={profile.eveningSafety}
                  onChange={(e) => patch({ eveningSafety: e.target.checked })} />
                夜晚安全优先
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className={lbl}>
                <span>饮食 / 忌口</span>
                <input className={num} placeholder="如 不吃辣、素食"
                  value={profile.diet ?? ""} onChange={(e) => patch({ diet: e.target.value })} />
              </label>
              <label className={lbl}>
                <span>一定要去</span>
                <input className={num} placeholder="如 鼓浪屿、看一次日落"
                  value={profile.mustSee ?? ""} onChange={(e) => patch({ mustSee: e.target.value })} />
              </label>
              <label className={lbl}>
                <span>尽量避免</span>
                <input className={num} placeholder="如 爬山、人多排队的景点"
                  value={profile.avoid ?? ""} onChange={(e) => patch({ avoid: e.target.value })} />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input type="password" className={num} placeholder="API Key *"
          value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <input className={num} placeholder="Base URL（可选，默认 OpenAI）"
          value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        <input className={num} placeholder="模型（可选，默认 gpt-4o-mini）"
          value={model} onChange={(e) => setModel(e.target.value)} />
      </div>

      <p className="mt-2 text-xs text-slate-400">
         API Key 仅用于本次请求，存于你的浏览器，不会上传到我们的服务器（本应用无后端）。
      </p>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button onClick={handleGenerate} disabled={loading}
        className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50">
        {loading ? "✨ 正在按体验曲线排行程…" : "✨ 生成攻略"}
      </button>
    </div>
  );
}