"use client";

import { Trip } from "@/types/trip";
import { TRANSPORT_LABELS } from "@/types/trip";
import { estimatedCost } from "@/lib/trip";
import { formatCNDate, formatMoney } from "@/lib/utils";

/**
 * Render a trip itinerary as a beautiful shareable image (Canvas 2D).
 * Designed for 小红书 / 微信 sharing. Returns a PNG data URL.
 */
export async function renderShareImage(trip: Trip): Promise<string> {
  const W = 750; // 3:4-ish vertical card, good for 小红书
  const MARGIN = 48;
  const contentW = W - MARGIN * 2;

  // Pre-measure height
  const lineH = 40;
  const actLines = trip.days.reduce(
    (s, d) => s + Math.max(1, d.activities.length),
    0
  );
  const dayHeaders = trip.days.length;
  const H =
    330 + // header block
    dayHeaders * 64 + // day headers
    actLines * lineH + // activity lines
    120; // footer

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // ---- Background gradient ----
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#eef2ff");
  grad.addColorStop(0.5, "#faf5ff");
  grad.addColorStop(1, "#fdf2f8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.arc(W - 60, 90, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  ctx.arc(60, H - 90, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  let y = MARGIN + 20;

  // ---- Title ----
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 44px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("🧳 " + trip.name, MARGIN, y);
  y += 52;

  // ---- Meta line ----
  ctx.font = "26px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillStyle = "#64748b";
  const meta = `📍 ${trip.destination}   📅 ${formatCNDate(
    trip.startDate
  )} 起 · 共 ${trip.days.length} 天`;
  ctx.fillText(meta, MARGIN, y);
  y += 40;
  const meta2 = `${TRANSPORT_LABELS[trip.transport]}   👥 ${
    trip.travelers
  } 人` + (trip.budget != null ? `   💰 预算 ${formatMoney(trip.budget)}` : "");
  ctx.fillText(meta2, MARGIN, y);
  y += 34;

  const cost = estimatedCost(trip);
  if (cost > 0) {
    ctx.fillStyle = "#059669";
    ctx.font = "bold 26px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(`🧾 预计花费 ${formatMoney(cost)}`, MARGIN, y);
    y += 30;
  }

  // Divider
  y += 16;
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(W - MARGIN, y);
  ctx.stroke();
  y += 30;

  // ---- Days ----
  trip.days.forEach((day, i) => {
    // Day header pill
    ctx.fillStyle = "#6366f1";
    roundRect(ctx, MARGIN, y - 30, 200, 44, 22);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(`Day ${i + 1}`, MARGIN + 22, y);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(formatCNDate(day.date), MARGIN + 220, y);
    y += 44;

    if (day.activities.length === 0) {
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "italic 24px sans-serif";
      ctx.fillText("（自由探索）", MARGIN + 8, y);
      y += lineH;
    } else {
      day.activities.forEach((a) => {
        ctx.fillStyle = "#334155";
        ctx.font = "24px 'PingFang SC','Microsoft YaHei',sans-serif";
        const time = a.startTime ? `${a.startTime} ` : "";
        let text = `• ${time}${a.title}`;
        if (a.location) text += ` @ ${a.location}`;
        ctx.fillText(clip(ctx, text, contentW), MARGIN + 8, y);
        y += lineH;
      });
    }
    y += 20;
  });

  // ---- Footer ----
  ctx.strokeStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(W - MARGIN, y);
  ctx.stroke();
  y += 44;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "22px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("✨ 由 Travel Planner 生成 · 开源 · 隐私友好", MARGIN, y);

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Clip long text with ellipsis to fit width. */
function clip(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + "…").width > maxW) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

/** Trigger a PNG download of the rendered share image. */
export async function downloadShareImage(trip: Trip): Promise<void> {
  const url = await renderShareImage(trip);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trip.name.replace(/[\\/:*?"<>|]/g, "_")}-分享卡片.png`;
  a.click();
}
