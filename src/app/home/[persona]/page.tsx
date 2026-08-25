/* G1-WHY: persona-adaptive homes (M03–M06) — priorities ordered by who's logged in.
   G2-BEST: one RSC route, server-side switch; desktop = 2-col (main + rail).
   G3-FUTURE: S — new persona = new branch + fixture entry. */

import { PERSONAS, type PersonaId } from "@/fixtures/passengers";
import { TRAINS_ALL } from "@/fixtures/trains";
import TatkalCountdown from "@/app/components/TatkalCountdown";
import NotifyInbox from "@/app/components/NotifyInbox";

export function generateStaticParams() {
  return Object.keys(PERSONAS).map((persona) => ({ persona }));
}

const VALID: PersonaId[] = ["priya", "sharmaji", "fatima"];

function Tile({ href, label, labelHi, emoji }: { href: string; label: string; labelHi: string; emoji: string }) {
  return (
    <a href={href} className="flex min-h-28 flex-col justify-center gap-1 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-surface-3 transition hover:-translate-y-0.5 hover:ring-primary">
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <span className="text-lg font-semibold text-primary">{label}</span>
      <span lang="hi" className="text-base opacity-70">{labelHi}</span>
    </a>
  );
}

function StatusCard() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3">
      <p className="text-xs font-semibold uppercase tracking-wider opacity-50">System status</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden />
        Availability · operational ✓
      </div>
      <p className="mt-1 text-base opacity-60">Updated 10 min ago</p>
    </div>
  );
}

export default async function PersonaHome({ params }: { params: Promise<{ persona: string }> }) {
  const { persona } = await params;

  if (!VALID.includes(persona as PersonaId)) {
    return (
      <section>
        <h1 className="text-xl font-semibold">Unknown traveller.</h1>
        <a href="/" className="text-primary underline">← pick again</a>
      </section>
    );
  }

  const p = PERSONAS[persona as PersonaId];

  if (persona === "sharmaji") {
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section>
          <h1 className="text-3xl font-bold text-primary-dark">नमस्ते, {p.name.split(" ")[0]} जी 🙏</h1>
          <p className="mt-1 opacity-75">आपके लिए तीन बड़े विकल्प — बस एक क्लिक।</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Tile href="/book/new?quota=GN" label="Book a ticket" labelHi="टिकट बुक करें" emoji="🎫" />
            <Tile href="/journey?pnr=4421876503&scenario=wl-confirm-overnight" label="My journey" labelHi="मेरी यात्रा" emoji="🧾" />
            <Tile href="/how-it-works" label="Help" labelHi="सहायता" emoji="💬" />
          </div>
          <div className="mt-6 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3">
            <p className="font-semibold">Your next trip</p>
            <p className="mt-1 text-lg">Ayodhya Dham Express · Sep 2 · Coach B2 · berth 34 (LOWER)</p>
            <p lang="hi" className="opacity-70">मंगलवार · प्लेटफ़ॉर्म 2 से रवानगी 22:14</p>
          </div>
        </section>
        <aside className="grid content-start gap-4"><StatusCard /></aside>
      </div>
    );
  }

  if (persona === "fatima") {
    const count = p.masterList.length;
    const child = p.masterList.find(x => x.isChild);
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section>
          <h1 className="text-3xl font-bold text-primary-dark">Khan family trip</h1>
          <p className="mt-1 opacity-75">One PNR for everyone — berths and paperwork handled.</p>

          <div className="mt-6 rounded-2xl bg-surface shadow-sm ring-1 ring-surface-3">
            <header className="flex items-center justify-between border-b border-surface-3 px-5 py-3">
              <span className="font-semibold">{count} travellers on this PNR</span>
              <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">2 lower berths secured</span>
            </header>
            <table className="w-full text-left">
              <thead><tr className="text-xs uppercase tracking-wide opacity-50">
                <th className="px-5 py-2 font-medium">Traveller</th><th className="px-3 py-2 font-medium">Age</th><th className="px-3 py-2 font-medium">Note</th>
              </tr></thead>
              <tbody>
                {p.masterList.map(m => (
                  <tr key={m.id} className="border-t border-surface-3">
                    <td className="px-5 py-2.5 font-medium">{m.name}</td>
                    <td className="px-3 py-2.5 tabular-nums">{m.age}</td>
                    <td className="px-3 py-2.5 opacity-75">{m.isChild ? "no seat · free (under 5)" : m.age >= 60 ? "senior · lower berth" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-surface-3 px-5 py-3">
              <a href="/book/new" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-6 font-semibold text-white transition hover:brightness-110">
                Book for family →
              </a>
            </div>
          </div>
          {child && <p className="mt-3 rounded-xl bg-surface-3 px-4 py-2.5 text-base">{child.name} rides free on laps — no berth needed.</p>}
        </section>
        <aside className="grid content-start gap-4"><NotifyInbox persona="fatima" /><StatusCard /></aside>
      </div>
    );
  }

  // priya (default)
  const next = TRAINS_ALL.find(t => t.from.code === "PUNE");
  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section>
        <h1 className="text-3xl font-bold text-primary-dark">Tonight&apos;s sprint ⚡</h1>
        <p className="mt-1 opacity-75">Tatkal window in — pre-stage now, win at 10:00.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-primary-dark text-white shadow-md sm:col-span-2">
            <div className="bg-accent px-5 py-1.5 text-sm font-extrabold uppercase tracking-wide text-ink">⚡ Tatkal armed · AC classes</div>
            <div className="space-y-3 p-5">
              <TatkalCountdown />
              <p className="opacity-85">Pune → New Delhi · pre-staged passengers · iPay wallet first</p>
              <a href="/book/new?quota=TQ"
                className="inline-flex min-h-12 items-center rounded-xl bg-white px-6 font-bold text-primary-dark transition hover:brightness-95">
                PRE-STAGE NOW →
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-50">Upcoming</p>
            {next && <p className="mt-1 font-medium">{next.name} · {next.depTime} → {next.arrTime}</p>}
            <p className="mt-0.5 text-base opacity-70">PNR 442·1876503 · confirmed</p>
            <a href="/journey?pnr=4421876503" className="mt-2 inline-block font-medium text-primary underline underline-offset-2">Journey timeline →</a>
          </div>

          <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-50">Quick actions</p>
            <div className="mt-2 grid gap-2">
              <a href="/book/new?quota=TQ&scenario=pay-fail-recover" className="min-h-11 rounded-xl bg-surface-3 px-4 py-2.5 font-medium transition hover:bg-surface-2">▶ Demo: payment recovery</a>
              <a href="/book/new?quota=GN" className="min-h-11 rounded-xl bg-surface-3 px-4 py-2.5 font-medium transition hover:bg-surface-2">🎫 General booking</a>
            </div>
          </div>
        </div>
      </section>
      <aside className="grid content-start gap-4"><NotifyInbox persona="priya" /><StatusCard /></aside>
    </div>
  );
}
