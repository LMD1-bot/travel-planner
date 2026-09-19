"use client";

import { Trip } from "@/types/trip";

/**
 * Encode a Trip into a URL-safe share token (no backend needed).
 * JSON -> UTF-8 -> base64url. Compact by stripping transport-irrelevant fields.
 */
export function encodeTrip(trip: Trip): string {
  const payload = {
    v: 1,
    n: trip.name,
    d: trip.destination,
    s: trip.startDate,
    e: trip.endDate,
    t: trip.travelers,
    b: trip.budget,
    tr: trip.transport,
    no: trip.notes,
    days: trip.days.map((d) => ({
      date: d.date,
      a: d.activities.map((x) => ({
        ti: x.title,
        lo: x.location,
        st: x.startTime,
        et: x.endTime,
        no: x.notes,
        co: x.cost,
      })),
    })),
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a share token back into a displayable trip-like object. */
export function decodeTrip(token: string): Trip | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const p = JSON.parse(json);
    const now = new Date().toISOString();
    return {
      id: "shared-" + token.slice(0, 8),
      name: p.n,
      destination: p.d,
      startDate: p.s,
      endDate: p.e,
      travelers: p.t ?? 1,
      budget: p.b,
      transport: p.tr ?? "other",
      notes: p.no,
      days: (p.days ?? []).map(
        (d: { date: string; a: { ti?: string; lo?: string; st?: string; et?: string; no?: string; co?: number }[] }, i: number) => ({
          date: d.date,
          activities: (d.a ?? []).map((x, j) => ({
            id: `s${i}-${j}`,
            title: x.ti ?? "",
            location: x.lo,
            startTime: x.st,
            endTime: x.et,
            notes: x.no,
            cost: x.co,
          })),
        })
      ),
      checklist: [],
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

/** Build the full share URL for a trip. */
export function buildShareUrl(trip: Trip): string {
  const token = encodeTrip(trip);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/share#${token}`;
}

/** Read the trip from the current location hash, if present. */
export function tripFromHash(hash: string): Trip | null {
  const token = hash.replace(/^#/, "");
  if (!token) return null;
  return decodeTrip(token);
}
