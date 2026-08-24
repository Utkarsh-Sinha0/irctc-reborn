# IRCTC Reborn · यात्रा

A citizen-first rebuild of India's train booking experience — **web-only demo** built for the *Build What Moves India* hackathon (OpenAI × Varun Mayya). Everything that touches money or government systems is mocked and labeled; everything you can judge — flows, math, honesty — is real, tested code.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
```

> Windows note: if a stray `NODE_ENV` env var exists, run `env -u NODE_ENV npx next dev`.

Production build:

```bash
npm run build
npm start
```

## Judge login

Pick any traveller chip on the landing page (Priya / Sharma ji / Fatima) — each opens a different home tuned to that persona. Or use "Try as guest".

**Demo scenarios** (append to any URL): `?scenario=clean | tatkal-rush | pay-fail-recover | wl-confirm-overnight | refund-failed-bank | elder-first-login`

Try `/book/new?quota=TQ&scenario=pay-fail-recover` → complete a booking → watch the scripted gateway timeout → 12s reconciliation → ticket. Nothing real is charged; the audit trail shows every step.

## What's real vs mocked

See `/how-it-works` in the app — a screen-by-screen table mapping each surface to its production integration (railway availability API, PCI-DSS payment adapter, SMS/Push outbox), plus citations (CRIS/PIB 2018 confirmation-probability tool, IEEE ICACCTech 2024 LightGBM waitlist prediction at 96.67%, Cloudflare Waiting Room engineering, Stripe idempotency keys, Helland CIDR 2007).

## Architecture in one breath

Next.js 16 App Router, RSC-first (server components ship zero JS on read screens; client islands only where interaction lives). Pure domain engines (`src/engine/*`: April-2026 cancellation matrix, fare rules in integer paise, WL probability bands, money-safe Booking FSM with idempotency + sweep reconciliation) wrapped by deterministic seeded fixtures (`src/fixtures/*`) and a scenario engine (`src/lib/scenarios.ts`). Signed HttpOnly session cookies. Motion v13 via LazyMotion for compositor-only animation with global reduced-motion support. Security headers in `next.config.ts`. Deploy target: Vercel (works on any Node host).

## Quality gates

- TypeScript strict, zero errors
- 37 vitest tests: cancellation boundaries (72h/24h/8h), FSM money-invariants (AMBIGUOUS never auto-fails; double-pay is a no-op; tickets only from settled states), fare total≡sum, band monotonicity, fixture determinism
- Production security headers; synthetic-data hygiene (no real-format PII anywhere)

## Deployment

1. Push this repo to GitHub.
2. Import into Vercel → framework auto-detected (Next.js).
3. Optional env var: `SESSION_SECRET=<random string>` (falls back to a documented dev secret).
4. Deploy. Done — static shells serve from CDN edge; API routes run as functions.
