/**
 * G1-WHY: /api/search — M09 results feed. Composes F1 availability + E3 bands so the
 * payload arrives pre-integrated (fixture contract). Scenario-aware (S).
 * G2-BEST: GET with query params = shareable/bookmarkable searches (URL-as-state).
 * G3-FUTURE: blast-radius S — pure read route; results UI consumes its exact shape.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TRAINS_ALL, classesFor, availabilityFor } from "@/fixtures/trains";
import { confirmBand } from "@/engine/wl-bands";
import { resolveScenario, jitter } from "@/lib/scenarios";

const Query = z.object({
  from: z.string().min(2).max(6),
  to: z.string().min(2).max(6),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quota: z.enum(["GN", "TQ"]).default("GN"),
});

export async function GET(req: NextRequest) {
  const script = resolveScenario(req.nextUrl.searchParams);
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "BAD_QUERY", message: "from/to/date required", retriable: false } }, { status: 400 });
  }
  await jitter(script);

  const { from, to, date, quota } = parsed.data;
  const dayIdx = new Date(`${date}T00:00:00+05:30`).getUTCDay();

  const trains = TRAINS_ALL.filter(t => t.from.code === from && t.to.code === to && t.runsOn.includes(dayIdx));
  const results = trains.flatMap(t =>
    classesFor(t.number).map(cls => {
      const av = availabilityFor({ trainNumber: t.number, journeyDate: date, travelClass: cls, quota, scenarioKey: script.key });
      const bandInput = { trainNumber: t.number, travelClass: cls, quota, journeyDateIso: date, kind: av.kind, count: av.count };
      const band = confirmBand(bandInput);
      return {
        ...av,
        confirmBandPct: band.pct,
        worstCase: band.worstCase,
        noteKey: band.noteKey,
      };
    })
  );

  // group by train for the list UI
  const grouped = trains.map(t => ({
    train: t,
    availabilities: results.filter(r => r.trainNumber === t.number),
  }));

  return NextResponse.json({ ok: true, serverTimeIso: new Date().toISOString(), data: { from, to, date, quota, rush: script.rush ?? false, groups: grouped } });
}
