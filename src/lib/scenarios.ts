/**
 * G1-WHY: Scenario engine (S) — judges reproduce edge cases by URL (?scenario=…),
 * turning the ORIGINAL portal's failure modes into scripted, capped demos (M30,
 * matrix acceptance). Also enforces edge E6: failure loops are time-capped.
 * G2-BEST: pure resolver from searchParams → script object; whitelisted keys only;
 * unknown keys fall back to "clean" with a flag so UI can show a gentle notice.
 * Rejected: middleware-based injection (hidden magic); per-route duplication.
 * G3-FUTURE: blast-radius M — every /api route composes this. Adding scenarios =
 * adding one entry to SCENARIOS; no route edits.
 */
export type ScenarioKey =
  | "clean"
  | "tatkal-rush"
  | "pay-fail-recover"
  | "wl-confirm-overnight"
  | "refund-failed-bank"
  | "elder-first-login";

export interface ScenarioScript {
  key: ScenarioKey;
  /** base latency jitter range applied to /api responses (ms) */
  latency: [number, number];
  /** inject a gateway timeout at payment for first N attempts */
  gatewayTimeoutFirstAttempts?: number;
  /** force WL→CNF movement events in timeline */
  confirmOvernight?: boolean;
  /** refund stuck at bank for refund-timeline demo */
  refundStuckAtBank?: boolean;
  /** rush mode: queue badge + lite seat list flags */
  rush?: boolean;
  /** unknown scenario requested */
  invalid?: boolean;
}

const SCENARIOS: Record<ScenarioKey, Omit<ScenarioScript, "key" | "invalid">> = {
  clean:                 { latency: [180, 420] },
  "tatkal-rush":         { latency: [250, 650], rush: true },
  "pay-fail-recover":    { latency: [200, 480], gatewayTimeoutFirstAttempts: 1 },
  "wl-confirm-overnight":{ latency: [180, 420], confirmOvernight: true },
  "refund-failed-bank":  { latency: [180, 420], refundStuckAtBank: true },
  "elder-first-login":   { latency: [220, 500], rush: false },
};

const KEYS = new Set(Object.keys(SCENARIOS) as ScenarioKey[]);

export function resolveScenario(searchParams: URLSearchParams | string | null | undefined): ScenarioScript {
  const raw = typeof searchParams === "string"
    ? new URLSearchParams(searchParams).get("scenario")
    : searchParams?.get("scenario") ?? null;

  if (!raw || raw === "clean") return { ...SCENARIOS.clean, key: "clean" };
  if (!KEYS.has(raw as ScenarioKey)) {
    return { ...SCENARIOS.clean, key: "clean", invalid: true };
  }
  return { ...(SCENARIOS as Record<string, Omit<ScenarioScript, "key" | "invalid">>)[raw], key: raw as ScenarioKey };
}

/** Latency jitter without Math.random (protocol law): time-derived entropy, bounded to script's band. */
export function jitter(script: ScenarioScript): Promise<void> {
  const [lo, hi] = script.latency;
  const span = hi - lo;
  const ms = lo + (Date.now() % 9973) % span;
  return new Promise(res => setTimeout(res, ms));
}
