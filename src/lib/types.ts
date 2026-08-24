/**
 * G1-WHY: kernel types — every module boundary validates against these (matrix §2.1).
 * G2-BEST: zod schemas as single source; static inferred types exported alongside — no drift.
 * G3-FUTURE: blast-radius L. Every feature imports from here; changes are council-gated.
 */
import { z } from "zod";

/* ---------- domain enums ---------- */
export const TravelClass = z.enum(["1A", "EC", "2A", "3A", "3E", "CC", "SL", "2S"]);
export type TravelClass = z.infer<typeof TravelClass>;

export const Quota = z.enum(["GN", "TQ", "PT", "LD", "SS", "HP"]);
export type Quota = z.infer<typeof Quota>;

export const BookingStatus = z.enum([
  "DRAFT",
  "PASSENGERS",
  "PAY_INITIATED",
  "GATEWAY_PENDING",
  "PAID",
  "AMBIGUOUS",
  "FAILED",
  "RECONCILED",
  "TICKET_ISSUED",
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const AvailabilityKind = z.enum(["AVAILABLE", "RAC", "WL"]);
export type AvailabilityKind = z.infer<typeof AvailabilityKind>;

/* ---------- entities ---------- */
export const Station = z.object({
  code: z.string().min(2).max(6),
  name: z.string().min(2),
  nameHi: z.string().optional(),
});
export type Station = z.infer<typeof Station>;

export const Passenger = z.object({
  id: z.string(),
  name: z.string().min(2).max(40),
  age: z.number().int().min(0).max(125),
  gender: z.enum(["M", "F", "X"]),
  berthPref: z.enum(["LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "NO_PREF"]).default("NO_PREF"),
  isChild: z.boolean(), // age <5 → no seat, no fare
  foodChoice: z.enum(["NONE", "VEG", "NON_VEG"]).default("NONE"),
});
export type Passenger = z.infer<typeof Passenger>;

export const TrainSummary = z.object({
  number: z.string().regex(/^\d{5}$/),
  name: z.string(),
  from: Station,
  to: Station,
  depTime: z.string(), // "HH:MM" IST
  arrTime: z.string(),
  durationMin: z.number().int(),
  runsOn: z.array(z.number().int().min(0).max(6)), // 0=Sun
});
export type TrainSummary = z.infer<typeof TrainSummary>;

/** Per class+quota availability for a train on a date (deterministic per seed+scenario) */
export const Availability = z.object({
  trainNumber: z.string(),
  journeyDate: z.string(), // ISO yyyy-mm-dd (kept short to avoid shadowing)
  travelClass: TravelClass,
  quota: Quota,
  kind: AvailabilityKind,
  count: z.number().int(), // seats avail / RAC n / WL n
  confirmBandPct: z.number().min(0).max(100), // E3 output
  worstCase: z.string(), // "RAC" | "WL#12 at chart" etc.
  autoRefundIfNot: z.boolean(),
});
export type Availability = z.infer<typeof Availability>;

export const FareLine = z.object({
  label: z.string(),
  labelHi: z.string().optional(),
  amountPaise: z.number().int(), // integer paise — no float money anywhere
});
export type FareLine = z.infer<typeof FareLine>;

export const FareQuote = z.object({
  idempotencyKey: z.string().uuid(),
  travelClass: TravelClass,
  quota: Quota,
  lines: z.array(FareLine),
  totalPaise: z.number().int(),
  passengersCount: z.number().int().min(1).max(6),
});
export type FareQuote = z.infer<typeof FareQuote>;

/** Frozen at PayInitiated — the D1 edge-case guard */
export const FrozenQuote = FareQuote.extend({ frozenAtIso: z.string() });
export type FrozenQuote = z.infer<typeof FrozenQuote>;

export const Ticket = z.object({
  pnr: z.string().regex(/^\d{10}$/),
  bookingId: z.string().uuid(),
  train: TrainSummary,
  journeyDate: z.string(),
  travelClass: TravelClass,
  quota: Quota,
  passengers: z.array(Passenger.extend({
    coach: z.string().optional(), // "S4"
    berthNo: z.number().int().optional(),
    berthType: z.enum(["LB", "MB", "UB", "SL", "SU"]).optional(),
    status: z.enum(["CNF", "RAC", "WL"]),
  })),
  totalPaise: z.number().int(),
  issuedAtIso: z.string(),
});
export type Ticket = z.infer<typeof Ticket>;

/* ---------- API envelopes ---------- */
export const ApiOk = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ ok: z.literal(true), data, serverTimeIso: z.string() });
export const ApiErr = z.object({
  ok: z.literal(false),
  error: z.object({ code: z.string(), message: z.string(), retriable: z.boolean() }),
});

export const JourneyEvent = z.object({
  atIso: z.string(),
  kind: z.enum([
    "BOOKED", "CHART_PREPARED", "COACH_ASSIGNED", "PLATFORM_HINT",
    "DELAY", "CANCELLED", "REFUND_INITIATED", "REFUND_CREDITED", "WL_CONFIRMED",
  ]),
  title: z.string(),
  titleHi: z.string().optional(),
  detail: z.string().optional(),
});
export type JourneyEvent = z.infer<typeof JourneyEvent>;
