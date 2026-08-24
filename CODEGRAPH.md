/**
 * CODEGRAPH.md — IRCTC Reborn (web-only)
 * Living graph: node = file/module, edge = import or API contract.
 * Protocol: docs/08-code-graph-protocol.md (Pre-Write Gate + verification cadence)
 *
 * Product constraints (binding): WEB-ONLY (no native apps; PWA patterns allowed).
 * Stack: Ashoka Stack v2 (docs/02) — Next 16.3.2 / React 19.2.8 / Tailwind v4 / Motion 13.
 * Env gotcha: run next commands as `env -u NODE_ENV npx ...` on this machine.
 *
 ## Graph (updated per commit)
 [kernel/types] ← imported by ALL
 [kernel/session] ← auth-mock, booking routes
 [engine/E1 FareRules] ← fare-sheet M14
 [engine/E2 CancelMatrix2026] ← cancel-slider M15, refund-timeline M26
 [engine/E3 WLBands] ← results M10, watcher M24
 [engine/E4 BookingFSM] ← pay routes M17–M19
 [fixtures/F1 trains] ← search/results/timeline
 [fixtures/F2 passengers] ← passenger picker
 [scenarios/S engine] ← all /api routes (latency+failure injection)
 */
