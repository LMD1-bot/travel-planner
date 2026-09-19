export type TransportMode =
  | "flight"
  | "train"
  | "car"
  | "bus"
  | "walk"
  | "other";

export interface Activity {
  id: string;
  title: string;
  location?: string;
  startTime?: string; // "HH:mm"
  endTime?: string;
  notes?: string;
  cost?: number; // estimated cost in CNY
}

export interface DayPlan {
  date: string; // ISO date "YYYY-MM-DD"
  activities: Activity[];
}

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