/**
 * G1-WHY: /api/auth — sets the signed session cookie for persona login (M01).
 * G2-BEST: minimal POST; reuses HMAC session signer; HttpOnly+lax.
 * G3-FUTURE: S blast-radius. Production note: replaced by real identity+OTP adapter.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signPayload, SESSION_COOKIE } from "@/lib/session";

const Body = z.object({ personaId: z.enum(["priya", "sharmaji", "fatima"]) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "BAD_BODY", message: "personaId required", retriable: false } }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, serverTimeIso: new Date().toISOString(), data: { personaId: parsed.data.personaId } });
  res.cookies.set(SESSION_COOKIE, signPayload({ personaId: parsed.data.personaId }), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24,
  });
  return res;
}
