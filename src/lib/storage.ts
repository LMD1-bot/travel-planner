"use client";

import { Trip } from "@/types/trip";

const KEY = "travel-planner.trips.v1";

export function loadTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Trip[]) : [];
  } catch {
    return [];
  }
}

export function saveTrips(trips: Trip[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(trips));
}

export function upsertTrip(trip: Trip): Trip[] {
  const trips = loadTrips();
  const idx = trips.findIndex((t) => t.id === trip.id);
  if (idx >= 0) trips[idx] = trip;
  else trips.push(trip);
  saveTrips(trips);
  return trips;
}

export function deleteTrip(id: string): Trip[] {
  const trips = loadTrips().filter((t) => t.id !== id);
  saveTrips(trips);
  return trips;
}

export function getTrip(id: string): Trip | undefined {
  return loadTrips().find((t) => t.id === id);
}

/** Export all trips as a downloadable JSON file. */
export function exportTrips(trips: Trip[]): void {
  const blob = new Blob([JSON.stringify(trips, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `travel-planner-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import trips from a JSON file; returns number imported. */
export async function importTrips(file: File): Promise<number> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error("备份文件格式不正确");
  const existing = loadTrips();
  const byId = new Map(existing.map((t) => [t.id, t]));
  let count = 0;
  for (const t of data as Trip[]) {
    if (t && typeof t.id === "string" && typeof t.name === "string") {
      byId.set(t.id, t);
      count++;
    }
  }
  saveTrips([...byId.values()]);
  return count;
}