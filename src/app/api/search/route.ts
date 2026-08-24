/**
 * G1-WHY: /api/search v2 — one-shot availability matrix per train (user directive:
 * all quotas in one row, no quota picker, no re-search). Composes buildMatrix so the
 * UI receives everything preloaded in a single request.
 * G2-BEST: replaces the old per-quota shape entirely; deterministic; scenario passthrough.
 * G3-FUTURE: S blast-radius now that SearchForm is rewritten to consume `rows`.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TRAINS_ALL, classesFor } from "@/fixtures/trains";
import { buildMatrix } from "@/engine/availability-matrix";
import { resolveScenario, jitter } from "@/lib/scenarios";

const Query = z.object({
  from: z.string().min(2).max(6),
  to: z.string().min(2).max(6),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: NextRequest) {
  const script = resolveScenario(req.nextUrl.searchParams);
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "BAD_QUERY", message: "from/to/date required", retriable: false } }, { status: 400 });
  }
  await jitter(script);

  const { from, to, date } = parsed.data;
  const dayIdx = new Date(`${date}T00:00:00+05:30`).getUTCDay();
  const trains = TRAINS_ALL.filter(t => t.from.code === from && t.to.code === to && t.runsOn.includes(dayIdx));

  const groups = trains.map(t => ({
    train: t,
    matrix: buildMatrix({
      trainNumber: t.number,
      journeyDate: date,
      classes: classesFor(t.number),
      scenarioKey: script.key,
    }).rows,
  }));

  return NextResponse.json({
    ok: true,
    serverTimeIso: new Date().toISOString(),
    data: { from, to, date, rush: script.rush ?? false, groups },
  });
}
