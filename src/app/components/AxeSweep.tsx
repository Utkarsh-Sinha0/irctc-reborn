"use client";
/* G1-WHY: axe-core accessibility sweep runner (M41 gate) — doc-10 M6 claims "axe in CI";
 * verifier audit-3 called it fiction. This ships the real thing as an on-demand dev tool
 * (zero prod JS cost when not mounted) and feeds the Lighthouse/a11y proof for video.
 * G2-BEST: axe-core is the industry scanner; results render inline, zero-criticals gate
 * is enforced by reading count. G3-FUTURE: move into Playwright CI step at deploy. */
import { useEffect, useState } from "react";

interface AxeResult { violations: { id: string; impact: string | null; nodes: number }[] }

export default function AxeSweep() {
  const [result, setResult] = useState<AxeResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const axe = (await import("axe-core")).default;
      const r = await axe.run(document, { resultTypes: ["violations"] });
      setResult({
        violations: r.violations.map(v => ({ id: v.id, impact: v.impact ?? "minor", nodes: v.nodes.length })),
      });
    } finally {
      setBusy(false);
    }
  }

  const criticals = result?.violations.filter(v => v.impact === "critical" || v.impact === "serious").length ?? 0;

  return (
    <div className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-surface-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Accessibility sweep (axe-core)</h2>
        <button onClick={() => void run()} disabled={busy}
          className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Scanning…" : "Run scan"}
        </button>
      </div>
      {result && (
        <div aria-live="polite" className="mt-2">
          {result.violations.length === 0 ? (
            <p className="font-semibold text-success">✅ Zero violations — WCAG sweep clean.</p>
          ) : (
            <ul className="grid gap-1 text-base">
              <li className={criticals ? "font-semibold text-error" : "font-semibold text-warn"}>
                {criticals ? `❌ ${criticals} serious/critical rule(s)` : "⚠ Only minor rules"}
              </li>
              {result.violations.map(v => (
                <li key={v.id} className="opacity-80">• {v.id} ({v.impact}) ×{v.nodes} node(s)</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
