/* G1-WHY: ticket route wrapper (M20/M21) — audit-2 F4 fix: verifies the signed-cookie
   booking machine is truly TICKET_ISSUED before rendering celebration; otherwise shows
   an honest "no completed booking" state. G2-BEST: server-side verification via session
   signer; no client trust. G3-FUTURE: M — this is where a real bookings store slots in. */
import TicketCard from "@/app/components/TicketCard";
import { verifyPayload, SESSION_COOKIE } from "@/lib/session";
import type { BookingMachine } from "@/engine/booking-fsm";
import { cookies } from "next/headers";

export default async function TicketPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").filter(Boolean);
  const key = sp.key ?? crypto.randomUUID();
  const bookingId = sp.bookingId ?? "";

  // F4: only celebrate a machine that genuinely reached TICKET_ISSUED.
  let issued = false;
  if (bookingId) {
    const jar = await cookies();
    const store = verifyPayload<Record<string, BookingMachine>>(jar.get(SESSION_COOKIE)?.value);
    issued = store?.[bookingId]?.state === "TICKET_ISSUED";
  }

  if (!issued) {
    return (
      <section className="pt-10 text-center">
        <h1 className="text-2xl font-bold">No completed booking here yet.</h1>
        <p className="mt-2 opacity-75">
          This page only lights up after the payment state machine reaches
          {" "}<strong>TICKET_ISSUED</strong> — exactly like the real thing.
        </p>
        <a href="/book/new" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white">
          Start a booking →
        </a>
        <p className="mt-4 text-base opacity-60">Demo note: nothing real was charged; synthetic data only.</p>
      </section>
    );
  }

  return <TicketCard idempotencyKey={key} ids={ids} scenario={sp.scenario ?? "clean"} />;
}
