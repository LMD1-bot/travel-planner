import {
  Activity,
  DayIntensity,
  DayPlan,
  DEFAULT_PROFILE,
  TravelerProfile,
  Trip,
} from "@/types/trip";

export type CareLevel = "info" | "warn" | "danger";

export interface CareIssue {
  level: CareLevel;
  day: number | null;
  title: string;
  detail: string;
}

/** Relative physical/emotional cost of each activity kind. */
const LOAD: Record<string, number> = {
  sight: 1,
  meal: 0.2,
  rest: 0,
  transit: 0.5,
  peak: 0.9,
  shop: 0.6,
  stay: 0,
};

const MEAL_GAP_WARN = 300; // minutes between meals
const RESTROOM_STRETCH_WARN = 150; // minutes without a facility stop
const BUFFER_MIN = 20; // transit + slack between activities

function toMin(t?: string): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

/** Load contributed by one activity (accounts for duration). */
export function activityLoad(a: Activity): number {
  const base = LOAD[a.type ?? "sight"] ?? 1;
  const dur = a.durationMin ?? 90;
  return base * Math.max(0.5, Math.min(3, dur / 90));
}

export function dayLoad(day: DayPlan): number {
  return day.activities.reduce((s, a) => s + activityLoad(a), 0);
}

/**
 * Daily load ceiling for this traveller.
 * Period days are cut to ~60%: the body genuinely needs a lighter day.
 */
export function loadCap(profile: TravelerProfile, isPeriodDay: boolean): number {
  let cap =
    profile.physical === "low" ? 5 : profile.physical === "high" ? 10.5 : 7.5;
  if (profile.pace === "relaxed") cap *= 0.8;
  if (profile.pace === "packed") cap *= 1.2;
  if (profile.elders > 0) cap *= 0.85;
  if (profile.children > 0) cap *= 0.8;
  if (isPeriodDay) cap *= 0.6;
  return Math.round(cap * 10) / 10;
}

export function intensityOf(load: number, cap: number): DayIntensity {
  if (load <= cap * 0.6) return "light";
  if (load <= cap) return "medium";
  return "intense";
}

/** Timed activities in chronological order. */
function timedActs(day: DayPlan) {
  return day.activities
    .map((a) => ({ a, t: toMin(a.startTime) }))
    .filter((x): x is { a: Activity; t: number } => x.t != null)
    .sort((x, y) => x.t - y.t);
}

function isFacilityStop(a: Activity): boolean {
  return ["meal", "rest", "stay", "shop"].includes(a.type ?? "");
}
/**
 * Analyse a trip against the experience model and return care issues.
 * Pure & deterministic: works for AI-generated and hand-built trips alike.
 */
export function analyzeTrip(
  trip: Trip,
  profile: TravelerProfile = trip.profile ?? DEFAULT_PROFILE
): CareIssue[] {
  const issues: CareIssue[] = [];

  trip.days.forEach((day, i) => {
    const n = i + 1;
    const isPeriod = profile.periodDays.includes(n);
    const cap = loadCap(profile, isPeriod);
    const load = dayLoad(day);
    const timed = timedActs(day);
    const dayStart = timed[0]?.t ?? null;
    const dayEnd = timed.length ? timed[timed.length - 1].t : null;

    // 1. intensity vs personal comfort ceiling
    if (load > cap) {
      issues.push({
        level: isPeriod ? "danger" : "warn",
        day: n,
        title: `Day ${n} 强度超出舒适区`,
        detail: isPeriod
          ? `当天是生理期第 ${n} 天，已把建议上限下调到约 ${cap}（当前负荷约 ${load.toFixed(1)}）。建议删掉 1-2 个景点，换成就近的咖啡/室内活动，并保留可以随时回住处休息的余地。`
          : `负荷约 ${load.toFixed(1)}，超过你的舒适上限 ${cap}。建议把其中一项挪到其他天，或延长总天数。`,
      });
    }

    // 2. meal rhythm (blood sugar drives mood)
    const mealTimes = timed.filter((x) => x.a.type === "meal").map((x) => x.t);
    if (timed.length > 0 && mealTimes.length === 0) {
      issues.push({
        level: "warn",
        day: n,
        title: `Day ${n} 没有明确的用餐节点`,
        detail:
          "整天没有固定的吃饭时间，血糖波动会直接影响体力和情绪。建议至少锁死午餐和晚餐两个时间点，其余随缘。",
      });
    } else if (mealTimes.length > 0) {
      const first = mealTimes[0];
      if (dayStart != null && first - dayStart > 240) {
        issues.push({
          level: "warn",
          day: n,
          title: `Day ${n} 第一顿饭时间偏晚`,
          detail: `从行程开始到第一餐间隔约 ${((first - dayStart) / 60).toFixed(1)} 小时。建议出发前先吃早饭，或随身带点干粮，避免因饥饿产生情绪波动。`,
        });
      }
      for (let k = 1; k < mealTimes.length; k++) {
        const gap = mealTimes[k] - mealTimes[k - 1];
        if (gap > MEAL_GAP_WARN) {
          issues.push({
            level: "warn",
            day: n,
            title: `Day ${n} 两餐间隔 ${(gap / 60).toFixed(1)} 小时`,
            detail:
              "超过 5 小时容易低血糖，耐心和体力都会明显下降。建议中途补一份小食或饮品。",
          });
          break;
        }
      }
      const last = mealTimes[mealTimes.length - 1];
      if (dayEnd != null && dayEnd - last > 180) {
        issues.push({
          level: "info",
          day: n,
          title: `Day ${n} 晚餐后仍有较长时间活动`,
          detail: `晚餐后还有约 ${((dayEnd - last) / 60).toFixed(1)} 小时行程。建议安排在住宿地附近，方便随时结束。`,
        });
      }
    }

    // 3. rest block
    const hasRest = day.activities.some((a) => a.type === "rest");
    if (!hasRest && load >= 6) {
      issues.push({
        level: "warn",
        day: n,
        title: `Day ${n} 缺少休息时段`,
        detail:
          "连续游览通常在第 3-4 小时出现体力和耐心断崖。建议午后插入 45-60 分钟的回酒店小憩或咖啡馆坐一会儿。",
      });
    }

    // 4. transfer buffer (rushing is the biggest mood killer)
    for (let k = 1; k < timed.length; k++) {
      const prev = timed[k - 1].a;
      const cur = timed[k].a;
      const gap = timed[k].t - timed[k - 1].t;
      const need = (prev.durationMin ?? 90) + BUFFER_MIN;
      if (gap < need) {
        issues.push({
          level: "warn",
          day: n,
          title: `Day ${n} 「${cur.title}」衔接过紧`,
          detail: `「${prev.title}」到「${cur.title}」只有 ${gap} 分钟，扣除活动本身约 ${prev.durationMin ?? 90} 分钟后几乎没有路程和缓冲。建议留出 ${BUFFER_MIN} 分钟以上冗余，避免一路都在赶。`,
        });
        break;
      }
    }

    // 5. heavy activity during the post-lunch dip
    const dipHeavy = timed.filter(
      (x) =>
        x.t >= 13 * 60 &&
        x.t < 15 * 60 &&
        (x.a.type === "sight" || x.a.type === "peak") &&
        activityLoad(x.a) >= 1.2
    );
    if (dipHeavy.length > 0) {
      issues.push({
        level: "info",
        day: n,
        title: `Day ${n} 午后安排了较耗体力的活动`,
        detail:
          "13:00-15:00 是人体第二个精力低谷，更适合室内、有座位、可静态欣赏的安排。若必须游览，建议控制在 1 小时内并就近休息。",
      });
    }

    // 6. evening safety (opt-in)
    if (profile.eveningSafety) {
      const late = timed.filter((x) => x.t >= 21 * 60);
      if (late.length > 0) {
        issues.push({
          level: "warn",
          day: n,
          title: `Day ${n} 有 21:00 之后的安排`,
          detail:
            "已开启「夜晚安全优先」：建议把晚间活动放在明亮、人流较多的区域，提前确认返程方式（正规网约车/地铁），尽量在 22:00 前回到住宿地。",
        });
      }
    }

    // 7. restroom accessibility (opt-in)
    if (profile.restroomSensitive) {
      const facilities = timed.filter((x) => isFacilityStop(x.a)).map((x) => x.t);
      let worst = 0;
      let prevT: number | null = dayStart;
      for (const ft of facilities) {
        if (prevT != null) worst = Math.max(worst, ft - prevT);
        prevT = ft;
      }
      if (dayEnd != null && prevT != null) {
        worst = Math.max(worst, dayEnd - prevT);
      }
      if (worst > RESTROOM_STRETCH_WARN) {
        issues.push({
          level: "warn",
          day: n,
          title: `Day ${n} 有较长时间没有洗手间停靠`,
          detail: `最长约 ${(worst / 60).toFixed(1)} 小时没有明确的用餐/休息/回住处节点。建议在景区入口、商场或连锁咖啡店主动设置停靠点。`,
        });
      }
    }

    // 8. period care
    if (isPeriod) {
      issues.push({
        level: "info",
        day: n,
        title: `Day ${n} 已按生理期调整`,
        detail:
          "当天负荷上限已下调到约 6 折：避开长时间徒步、暴晒和久站，优先就近、可随时回住宿点的安排。建议带保温杯/暖贴，并允许自己随时取消某个行程。",
      });
    }

    // 9. peak experience
    const peaks = day.activities.filter((a) => a.type === "peak");
    if (peaks.length === 0 && !day.peak && day.activities.length >= 2) {
      issues.push({
        level: "info",
        day: n,
        title: `Day ${n} 缺少峰值体验`,
        detail:
          "一天里最好有一个「记忆锚点」——最打动人的那一刻。把它放在体力和光线最好的时段，比如日落、夜景或一顿特别的晚餐。",
      });
    }
    if (peaks.length > 1) {
      issues.push({
        level: "info",
        day: n,
        title: `Day ${n} 有 ${peaks.length} 个峰值安排`,
        detail:
          "峰值叠加会互相削弱，也容易疲惫。建议一天只保留一个真正的亮点，其余作为配角。",
      });
    }
  });

  return issues;
}

/** Compact trip-level health summary used by the UI header. */
export function tripHealth(
  trip: Trip,
  profile: TravelerProfile = trip.profile ?? DEFAULT_PROFILE
) {
  const issues = analyzeTrip(trip, profile);
  const perDay = trip.days.map((d, i) => {
    const isPeriod = profile.periodDays.includes(i + 1);
    const cap = loadCap(profile, isPeriod);
    const load = dayLoad(d);
    return { day: i + 1, load, cap, intensity: intensityOf(load, cap) };
  });
  return {
    issues,
    perDay,
    danger: issues.filter((x) => x.level === "danger").length,
    warn: issues.filter((x) => x.level === "warn").length,
    info: issues.filter((x) => x.level === "info").length,
  };
}