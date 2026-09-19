"use client";

import { useState } from "react";
import { generateTripWithAI } from "@/lib/ai";
import { Trip } from "@/types/trip";

interface Props {
  onCreated: (trip: Trip) => void;
}

export default function AiGenerateForm({ onCreated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      });
      onCreated(trip);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">
        🤖 AI 一键生成攻略
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        用一句话描述需求，AI 自动生成完整行程。
      </p>

      <textarea
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
        placeholder="例：五一去厦门玩3天，2个人，预算3000，喜欢海边和美食，行程别太赶"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          placeholder="API Key *"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          placeholder="Base URL（可选，默认 OpenAI）"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          placeholder="模型（可选，默认 gpt-4o-mini）"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <p className="mt-2 text-xs text-slate-400">
        🔒 API Key 仅用于本次请求，存于你的浏览器，不会上传到我们的服务器（本应用无后端）。
      </p>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "✨ 生成中…" : "✨ 生成攻略"}
      </button>
    </div>
  );
}
