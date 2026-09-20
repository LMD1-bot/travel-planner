import assert from "node:assert/strict";
import test from "node:test";
import {
  activityLoad,
  analyzeTrip,
  dayLoad,
  intensityOf,
  loadCap,
  tripHealth,
} from "@/lib/experience";
import {
  Activity,
  DEFAULT_PROFILE,
  DayPlan,
  TravelerProfile,
  Trip,
} from "@/types/trip";
import { TEMPLATES, instantiateTemplate } from "@/lib/templates";

let seq = 0;
function act(p: Partial<Activity>): Activity {
  seq += 1;
  return {
    id: "a" + seq,
    title: p.title ?? "activity",
    type: "sight",
    durationMin: 90,
    ...p,
  };
}

function day(date: string, activities: Activity[]): DayPlan {
  return { date, activities };
}

function makeTrip(days: DayPlan[], profile?: TravelerProfile): Trip {
  const now = "2026-05-01T00:00:00.000Z";
  return {
    id: "t1",
    name: "test trip",
    destination: "somewhere",
    startDate: days[0]?.date ?? "2026-05-01",
    endDate: days[days.length - 1]?.date ?? "2026-05-01",
    travelers: 2,
    transport: "train",
    days,
    checklist: [],
    profile,
    createdAt: now,
    updatedAt: now,
  };
}

function warnsOf(t: Trip) {
  return analyzeTrip(t).filter((i) => i.level !== "info");
}

function titles(t: Trip) {
  return analyzeTrip(t).map((i) => i.title);
}

/* ---------------- energy / load model ---------------- */

test("a meal costs far less energy than a long sight", () => {
  const meal = act({ type: "meal", durationMin: 60 });
  const sight = act({ type: "sight", durationMin: 180 });
  assert.ok(activityLoad(meal) < activityLoad(sight));
});

test("rest contributes zero load", () => {
  assert.equal(activityLoad(act({ type: "rest", durationMin: 120 })), 0);
});

test("dayLoad sums the activities of a day", () => {
  const d = day("2026-05-01", [
    act({ type: "sight", durationMin: 90 }),
    act({ type: "meal", durationMin: 60 }),
  ]);
  assert.ok(dayLoad(d) > 1 && dayLoad(d) < 2);
});

test("period days lower the daily ceiling to roughly 60%", () => {
  const normal = loadCap(DEFAULT_PROFILE, false);
  const period = loadCap(DEFAULT_PROFILE, true);
  assert.ok(period < normal);
  assert.ok(Math.abs(period / normal - 0.6) < 0.01);
});

test("a lower physical level means a lower ceiling", () => {
  const low = loadCap({ ...DEFAULT_PROFILE, physical: "low" }, false);
  const high = loadCap({ ...DEFAULT_PROFILE, physical: "high" }, false);
  assert.ok(low < high);
});

test("intensityOf grades load against the ceiling", () => {
  assert.equal(intensityOf(1, 10), "light");
  assert.equal(intensityOf(8, 10), "medium");
  assert.equal(intensityOf(12, 10), "intense");
});
/* ---------------- pacing & care checks ---------------- */

test("an overloaded day is flagged", () => {
  const heavy = day("2026-05-01", [
    act({ startTime: "09:00", durationMin: 180 }),
    act({ startTime: "13:00", durationMin: 180 }),
    act({ startTime: "17:00", durationMin: 180 }),
    act({ startTime: "20:00", durationMin: 180 }),
  ]);
  const found = titles(makeTrip([heavy]));
  assert.ok(found.some((t) => t.includes("强度超出舒适区")));
});

test("a day without meals is flagged", () => {
  const d = day("2026-05-01", [
    act({ startTime: "09:00", type: "sight" }),
    act({ startTime: "14:00", type: "sight" }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(found.some((t) => t.includes("没有明确的用餐节点")));
});

test("meals more than 5 hours apart are flagged", () => {
  const d = day("2026-05-01", [
    act({ startTime: "08:00", type: "meal" }),
    act({ startTime: "15:00", type: "meal" }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(found.some((t) => t.includes("两餐间隔")));
});

test("a tight transfer between activities is flagged", () => {
  const d = day("2026-05-01", [
    act({ startTime: "09:00", durationMin: 120, title: "A" }),
    act({ startTime: "10:30", durationMin: 60, title: "B" }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(found.some((t) => t.includes("衔接过紧")));
});

test("a heavy day without a rest block is flagged", () => {
  const d = day("2026-05-01", [
    act({ startTime: "08:00", durationMin: 180 }),
    act({ startTime: "12:30", durationMin: 180 }),
    act({ startTime: "16:00", durationMin: 180 }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(found.some((t) => t.includes("缺少休息时段")));
});

test("a day with two peak moments is flagged", () => {
  const d = day("2026-05-01", [
    act({ startTime: "09:00", type: "peak", title: "sunrise" }),
    act({ startTime: "18:00", type: "peak", title: "sunset" }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(found.some((t) => t.includes("峰值安排")));
});

test("a day without any peak moment is flagged", () => {
  const d = day("2026-05-01", [
    act({ startTime: "09:00", type: "sight" }),
    act({ startTime: "14:00", type: "meal" }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(found.some((t) => t.includes("缺少峰值体验")));
});
/* ---------------- individual care flags ---------------- */

test("a period day turns an overload into a danger-level finding", () => {
  const heavy = day("2026-05-01", [
    act({ startTime: "09:00", durationMin: 180 }),
    act({ startTime: "13:00", durationMin: 180 }),
    act({ startTime: "17:00", durationMin: 180 }),
    act({ startTime: "20:00", durationMin: 180 }),
  ]);
  const profile: TravelerProfile = { ...DEFAULT_PROFILE, periodDays: [1] };
  const issues = analyzeTrip(makeTrip([heavy], profile));
  const overload = issues.find((i) => i.title.includes("强度超出舒适区"));
  assert.ok(overload, "expected an overload finding");
  assert.equal(overload.level, "danger");
  assert.ok(overload.detail.includes("生理期"));
});

test("a period day always carries a care reminder", () => {
  const light = day("2026-05-01", [act({ startTime: "10:00", type: "rest" })]);
  const profile: TravelerProfile = { ...DEFAULT_PROFILE, periodDays: [1] };
  const found = analyzeTrip(makeTrip([light], profile)).map((i) => i.title);
  assert.ok(found.some((t) => t.includes("已按生理期调整")));
});

test("restroom sensitivity flags long stretches with no stop", () => {
  const d = day("2026-05-01", [
    act({ startTime: "09:00", type: "sight", durationMin: 120 }),
    act({ startTime: "13:00", type: "sight", durationMin: 120 }),
    act({ startTime: "17:00", type: "sight", durationMin: 120 }),
  ]);
  const on: TravelerProfile = { ...DEFAULT_PROFILE, restroomSensitive: true };
  const found = titles(makeTrip([d], on));
  assert.ok(found.some((t) => t.includes("洗手间停靠")));
});

test("restroom sensitivity stays quiet when it is turned off", () => {
  const d = day("2026-05-01", [
    act({ startTime: "09:00", type: "sight", durationMin: 120 }),
    act({ startTime: "13:00", type: "sight", durationMin: 120 }),
    act({ startTime: "17:00", type: "sight", durationMin: 120 }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(!found.some((t) => t.includes("洗手间停靠")));
});

test("evening safety flags plans after 21:00", () => {
  const d = day("2026-05-01", [
    act({ startTime: "19:00", type: "meal", durationMin: 60 }),
    act({ startTime: "21:30", type: "sight", durationMin: 60 }),
  ]);
  const on: TravelerProfile = { ...DEFAULT_PROFILE, eveningSafety: true };
  const found = titles(makeTrip([d], on));
  assert.ok(found.some((t) => t.includes("21:00 之后的安排")));
});

test("evening plans are not flagged when the option is off", () => {
  const d = day("2026-05-01", [
    act({ startTime: "19:00", type: "meal", durationMin: 60 }),
    act({ startTime: "21:30", type: "sight", durationMin: 60 }),
  ]);
  const found = titles(makeTrip([d]));
  assert.ok(!found.some((t) => t.includes("21:00 之后的安排")));
});
/* ---------------- positive case & summary ---------------- */

test("a well paced day produces no findings at all", () => {
  const balanced = day("2026-05-01", [
    act({ startTime: "07:30", type: "meal", durationMin: 60, title: "breakfast" }),
    act({ startTime: "09:00", type: "sight", durationMin: 120, title: "museum" }),
    act({ startTime: "12:00", type: "meal", durationMin: 60, title: "lunch" }),
    act({ startTime: "13:30", type: "rest", durationMin: 60, title: "hotel nap" }),
    act({ startTime: "15:00", type: "sight", durationMin: 90, title: "old town" }),
    act({ startTime: "17:00", type: "meal", durationMin: 30, title: "tea break" }),
    act({ startTime: "18:30", type: "peak", durationMin: 60, title: "sunset" }),
  ]);
  const issues = analyzeTrip(makeTrip([balanced]));
  assert.deepEqual(
    issues.map((i) => i.title),
    [],
    "a balanced day should not raise any finding"
  );
});

test("a rushed day raises strictly more findings than a balanced one", () => {
  const balanced = day("2026-05-01", [
    act({ startTime: "07:30", type: "meal", durationMin: 60 }),
    act({ startTime: "09:00", type: "sight", durationMin: 120 }),
    act({ startTime: "12:00", type: "meal", durationMin: 60 }),
    act({ startTime: "13:30", type: "rest", durationMin: 60 }),
    act({ startTime: "15:00", type: "sight", durationMin: 90 }),
    act({ startTime: "17:00", type: "meal", durationMin: 30 }),
    act({ startTime: "18:30", type: "peak", durationMin: 60 }),
  ]);
  const rushed = day("2026-05-01", [
    act({ startTime: "08:00", durationMin: 240, title: "A" }),
    act({ startTime: "10:00", durationMin: 240, title: "B" }),
    act({ startTime: "13:00", durationMin: 240, title: "C" }),
    act({ startTime: "20:00", durationMin: 240, title: "D" }),
  ]);
  assert.ok(warnsOf(makeTrip([rushed])).length > warnsOf(makeTrip([balanced])).length);
});

test("tripHealth summarises load, ceiling and severity counts", () => {
  const heavy = day("2026-05-01", [
    act({ startTime: "09:00", durationMin: 180 }),
    act({ startTime: "13:00", durationMin: 180 }),
    act({ startTime: "17:00", durationMin: 180 }),
    act({ startTime: "20:00", durationMin: 180 }),
  ]);
  const h = tripHealth(makeTrip([heavy]));
  assert.equal(h.perDay.length, 1);
  assert.equal(h.perDay[0].day, 1);
  assert.equal(h.perDay[0].intensity, "intense");
  assert.ok(h.perDay[0].load > h.perDay[0].cap);
  assert.ok(h.warn + h.danger > 0);
  assert.equal(h.issues.length, h.warn + h.danger + h.info);
});

test("a trip with no days does not crash", () => {
  assert.deepEqual(analyzeTrip(makeTrip([])), []);
});
/* ---------------- template integrity ---------------- */

test("every curated template builds a trip with matching day count", () => {
  for (const t of TEMPLATES) {
    const trip = instantiateTemplate(t.id);
    assert.ok(trip, "template " + t.id + " should instantiate");
    assert.equal(trip.days.length, t.days);
    assert.equal(trip.days.length, trip.days.filter((d) => d.activities.length > 0).length);
  }
});

test("template activities get inferred types so the experience model can read them", () => {
  const xiamen = instantiateTemplate("xiamen");
  assert.ok(xiamen);
  const types = xiamen.days.flatMap((d) => d.activities.map((a) => a.type));
  assert.ok(types.includes("meal"), "templates should contain meal nodes");
  assert.ok(types.includes("peak"), "templates should contain a peak moment");
  assert.ok(types.every((t) => typeof t === "string" && t.length > 0));
});

test("an unknown template id returns null instead of throwing", () => {
  assert.equal(instantiateTemplate("no-such-city"), null);
});
test("every template day carries exactly one peak experience", () => {
  for (const t of TEMPLATES) {
    const trip = instantiateTemplate(t.id);
    assert.ok(trip, "template " + t.id + " should instantiate");
    for (const d of trip.days) {
      assert.ok(d.peak, t.id + " " + d.date + " should declare a peak experience");
      assert.equal(
        d.activities.filter((a) => a.type === "peak").length,
        1,
        t.id + " " + d.date + " should mark exactly one peak activity"
      );
    }
  }
});

test("xiamen day 2 peak is the coastal ride", () => {
  const trip = instantiateTemplate("xiamen");
  assert.ok(trip);
  assert.ok(trip.days[1].peak?.includes("环岛路骑行"));
});