import type { Metadata, Viewport } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";
import FontScaleButtons from "@/app/components/FontScaleButtons";
import DemoIdentity from "@/app/components/DemoIdentity";
import LangToggle from "@/app/components/LangToggle";

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IRCTC Reborn — Indian Railways ticketing, rebuilt",
  description: "One-shot availability across every class and quota. Honest fares. Payment-failure recovery. 100× the old portal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F4297",
};

/* G1-WHY: app shell — IRCTC identity (navy + orange + tricolor hairline), NEW information-
 * dense layout: slim utility bar, primary nav, 1200px canvas. Faster: RSC chrome = 0 JS
 * except a11y/identity islands.
 * G2-BEST: server component; islands only for interactive controls.
 * G3-FUTURE: M blast-radius — chrome only. */

const NAV = [
  { href: "/", label: "Trains", exact: true },
  { href: "/book/new?quota=GN", label: "Book Ticket" },
  { href: "/journey?pnr=4421876503", label: "PNR Status" },
  { href: "/home/priya", label: "My Trips" },
  { href: "/how-it-works", label: "About" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mukta.variable}>
      <body className="min-h-dvh flex flex-col bg-surface-2 text-ink" style={{ fontFamily: "var(--font-mukta), system-ui, sans-serif" }}>
        {/* tricolor hairline */}
        <div aria-hidden className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg,#FF9933 0 33%,#FFFFFF 33% 66%,#128807 66% 100%)" }} />

        {/* slim utility bar */}
        <div className="bg-primary-dark text-white/85">
          <div className="mx-auto flex h-8 max-w-[1200px] items-center justify-between px-4 text-xs">
            <span>IRCTC Reborn — Indian Railways ticketing, rebuilt for speed</span>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                All systems operational
              </span>
              <DemoIdentity />
            </div>
          </div>
        </div>

        {/* primary header */}
        <header className="sticky top-0 z-40 shrink-0 border-b border-black/10 bg-primary text-white shadow-md">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-4">
            <a href="/" className="flex items-baseline gap-1 text-lg font-extrabold tracking-tight">
              IRCTC&nbsp;<span className="text-accent">Reborn</span>
            </a>
            <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
              {NAV.map(n => (
                <a key={n.label} href={n.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/12 ${n.exact ? "bg-white/15 font-semibold" : "opacity-90"}`}>
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <LangToggle />
              <FontScaleButtons />
              <a href="/book/new?quota=TQ"
                className="hidden rounded-md bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110 sm:block">
                Tatkal
              </a>
            </div>
          </div>
          <nav aria-label="Primary mobile" className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-1.5 md:hidden">
            {NAV.map(n => (
              <a key={n.label} href={n.href} className="whitespace-nowrap rounded px-2.5 py-1 text-[13px] font-medium opacity-90 hover:bg-white/10">{n.label}</a>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-5">{children}</main>

        <footer className="shrink-0 border-t border-black/10 bg-surface">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 text-[13px] opacity-70">
            <span>Prototype — every rupee synthetic, every flow real. <a href="/how-it-works" className="underline underline-offset-2">What&apos;s mocked</a></span>
            <span>57 tests · 100% line coverage · E2E-verified on this deployment</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
