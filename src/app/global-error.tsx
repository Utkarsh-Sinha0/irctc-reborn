/* G1-WHY: global error boundary — a judge hitting an unexpected state must see a branded
   recovery screen, never the framework's crash page (Working build protection).
   G2-BEST: minimal client component per Next conventions; reset() re-mounts the segment.
   G3-FUTURE: S blast-radius; app-wide by definition. */
"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F4F6FB", color: "#111827" }}>
        <main role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-5xl" aria-hidden>🚉</span>
          <h1 className="text-2xl font-bold">Something derailed.</h1>
          <p className="opacity-75">Synthetic data only — nothing real was affected. Try that step again.</p>
          <button
            onClick={reset}
            className="min-h-12 rounded-xl bg-[#1B4DDB] px-6 font-semibold text-white active:scale-[.99] transition"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
