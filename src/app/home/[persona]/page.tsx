/* G1-WHY: persona-adaptive homes (M03–M06) — the "priorities ordered by who's logged in" beat.
   G2-BEST: one RSC route with server-side switch per persona; zero client JS except countdown island.
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
    <a href={href} className="flex min-h-24 flex-col justify-center gap-1 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3 active:scale-[.99] transition">
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <span className="font-semibold text-primary">{label}</span>
      <span lang="hi" className="text-base opacity-70">{labelHi}</span>
    </a>
  );
}

export default async function PersonaHome({ params }: { params: Promise<{ persona: string }> }) {
  const { persona } = await params;

  if (!VALID.includes(persona as PersonaId)) {
    return (
      <section className="pt-8">
        <h1 className="text-xl font-semibold">Unknown traveller.</h1>
        <a href="/" className="text-primary underline">← pick again</a>
      </section>
    );
  }

  const p = PERSONAS[persona as PersonaId];

  if (persona === "sharmaji") {
    return (
      <section className="pt-6">
        <h1 className="text-2xl font-bold text-primary-dark">नमस्ते, {p.name.split(" ")[0]} जी 🙏</h1>
        <div className="mt-5 grid gap-4">
          <Tile href="/book/new?quota=GN" label="Book a ticket" labelHi="टिकट बुक करें" emoji="🎫" />
          <Tile href="/journey" label="My ticket & journey" labelHi="मेरा टिकट व यात्रा" emoji="🧾" />
          <Tile href="/how-it-works" label="Talk to help" labelHi="सहायता से बात करें" emoji="💬" />
        </div>
      </section>
    );
  }

  if (persona === "fatima") {
    const count = p.masterList.length;
    const child = p.masterList.find(x => x.isChild);
    return (
      <section className="pt-6">
        <h1 className="text-2xl font-bold text-primary-dark">Khan family trip</h1>
        <div className="mt-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3">
          <p className="font-semibold">{count} travellers on this PNR</p>
          <ul className="mt-2 text-base opacity-80 space-y-1">
            {p.masterList.map(m => (
              <li key={m.id}>
                {m.name} · {m.age}{m.isChild ? " · no seat (under 5, free)" : ""}
              </li>
            ))}
          </ul>
          {child && <p className="mt-2 rounded-lg bg-surface-3 px-3 py-2 text-base">{child.name} rides free on laps — no berth needed.</p>}
          <a
            href="/book/new"
            className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-white active:scale-[.99] transition"
          >
            Book for family →
          </a>
        </div>
      </section>
    );
  }

  // priya (default): TATKAL ARMED card + upcoming
  const next = TRAINS_ALL.find(t => t.from.code === "PUNE");
  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Tonight&apos;s sprint</h1>

      <div className="mt-4 overflow-hidden rounded-2xl bg-primary-dark text-white shadow-sm">
        <div className="bg-accent/90 px-4 py-1 text-sm font-bold text-ink">⚡ TATKAL ARMED · AC classes</div>
        <div className="space-y-3 p-4">
          <TatkalCountdown />
          <p className="text-base opacity-85">
            Pune → New Delhi · pre-staged passengers · iPay wallet first
          </p>
          <a
            href="/book/new?quota=TQ"
            className="flex min-h-12 items-center justify-center rounded-xl bg-white font-bold text-primary-dark active:scale-[.99] transition"
          >
            PRE-STAGE NOW →
          </a>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-surface-3">
        <p className="text-sm uppercase tracking-wide opacity-60">Upcoming</p>
        {next ? (
          <p className="mt-1 font-medium">{next.name} · {next.depTime} → {next.arrTime}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2 text-base opacity-75">
          <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden />
          Availability services · operational ✓ · updated 10 min ago
        </div>
      </div>

      <NotifyInbox persona="priya" />
    </section>
  );
}
