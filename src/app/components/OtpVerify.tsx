"use client";
/* G1-WHY: M02 OTP mock — paste-friendly, autofill-enabled, no cognitive puzzle (WCAG 3.3.8).
 * Demo identity: any 6 digits work; shows the pattern production would use.
 * G2-BEST: one input, paste/autofill attrs, auto-advance on 6 digits.
 * G3-FUTURE: S — swap verify() for real adapter. */
import { useEffect, useRef, useState } from "react";

export default function OtpVerify({ personaId, onDone }: { personaId: string; onDone: () => void }) {
  const [digits, setDigits] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  function onChange(v: string) {
    const clean = v.replace(/\D/g, "").slice(0, 6);
    setDigits(clean);
    setErr(null);
    if (clean.length === 6) void verify(clean);
  }

  async function verify(code: string) {
    try {
      const res = await fetch("/api/auth", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setErr("Verification failed. Try again.");
      setDigits("");
    }
  }

  return (
    <div className="rounded-xl border border-surface-3 bg-surface p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider opacity-50">Step 2 · Verify</p>
      <p className="mt-1 text-sm opacity-75">Enter the 6-digit code (any code works in this prototype — even your birth year).</p>
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete="one-time-code"
        name="otp"
        aria-label="6-digit verification code"
        placeholder="••••••"
        value={digits}
        onChange={e => onChange(e.target.value)}
        className="mt-3 w-full min-h-14 rounded-xl border border-surface-3 bg-surface-2 text-center font-mono text-2xl tracking-[0.5em]"
      />
      {err && <p role="alert" className="mt-2 text-sm text-error">⚠ {err}</p>}
      <p className="mt-2 text-[13px] opacity-60">
        Production: this screen never blocks with a distorted CAPTCHA — codes arrive by SMS/email and paste straight in
        (<abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 3.3.8 accessible auth).
      </p>
    </div>
  );
}
