export type TransportMode =
  | "flight"
  | "train"
  | "car"
  | "bus"
  | "walk"
  | "other";

/** Activity semantics — drives the experience / energy model. */
export type ActivityType =
  | "sight"
  | "meal"
  | "rest"
  | "transit"
  | "peak"
  | "shop"
  | "stay";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  sight: " 游览",
  meal: "🍜 用餐",
  rest: " 休息",
  transit: "🚕 交通",
  peak: "⭐ 峰值体验",
  shop: "️ 购物",
  stay: "🏨 住宿",
};

/** Per-day physical/emotional load rating. */
export type DayIntensity = "light" | "medium" | "intense";

export const INTENSITY_LABELS: Record<DayIntensity, string> = {
  light: " 轻松",
  medium: "🙂 适中",
  intense: "🔥 偏满",
};

export interface Activity {
  id: string;
  title: string;
  location?: string;
  startTime?: string; // "HH:mm"
  endTime?: string;
  notes?: string;
  cost?: number; // estimated cost in CNY
  type?: ActivityType;
  durationMin?: number; // expected duration, used for pacing checks
}

export interface DayPlan {
  date: string; // ISO date "YYYY-MM-DD"
  activities: Activity[];
  theme?: string; // e.g. "海边慢日"
  peak?: string; // the day's peak-experience moment
}

/** Traveller profile — the inputs that make planning human-centred. */
export interface TravelerProfile {
  adults: number;
  children: number;
  elders: number;
  pace: "relaxed" | "balanced" | "packed";
  physical: "low" | "medium" | "high";
  /** 1-based trip day numbers that are period days (lighter load + care). */
  periodDays: number[];
  restroomSensitive: boolean;
  eveningSafety: boolean;
  diet?: string;
  mustSee?: string;
  avoid?: string;
}

export const DEFAULT_PROFILE: TravelerProfile = {
  adults: 2,
  children: 0,
  elders: 0,
  pace: "balanced",
  physical: "medium",
  periodDays: [],
  restroomSensitive: false,
  eveningSafety: false,
};

export const PACE_LABELS: Record<TravelerProfile["pace"], string> = {
  relaxed: "🍃 慢节奏（每天少量景点）",
  balanced: "🙂 张弛有度",
  packed: "🔥 尽量多玩",
};

export const PHYSICAL_LABELS: Record<TravelerProfile["physical"], string> = {
  low: "😥 体力一般（多休息）",
  medium: " 一般水平",
  high: " 体力好（可暴走）",
};

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: "证件" | "衣物" | "电子" | "药品" | "其他";
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  travelers: number;
  budget?: number;
  transport: TransportMode;
  notes?: string;
  days: DayPlan[];
  checklist: ChecklistItem[];
  /** Experience design rationale produced with the plan. */
  designNote?: string;
  /** Care reminders (period, restroom, meals, safety, pacing...). */
  careNotes?: string[];
  /** The traveller profile this plan was designed for. */
  profile?: TravelerProfile;
  createdAt: string;
  updatedAt: string;
}

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  flight: "✈️ 飞机",
  train: "🚄 火车/高铁",
  car: "🚗 自驾",
  bus: "🚌 大巴",
  walk: "🚶 步行/骑行",
  other: "🧭 其他",
};

export const DEFAULT_CHECKLIST: Omit<ChecklistItem, "id">[] = [
  { label: "身份证 / 护照", done: false, category: "证件" },
  { label: "车票 / 机票确认", done: false, category: "证件" },
  { label: "换洗衣物", done: false, category: "衣物" },
  { label: "雨具 / 防晒", done: false, category: "衣物" },
  { label: "充电器 / 充电宝", done: false, category: "电子" },
  { label: "相机", done: false, category: "电子" },
  { label: "常用药 / 晕车药", done: false, category: "药品" },
  { label: "创可贴", done: false, category: "药品" },
];