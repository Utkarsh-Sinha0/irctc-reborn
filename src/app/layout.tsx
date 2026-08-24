import type { Metadata, Viewport } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";

/* G1-WHY: root shell — header/footer chrome + font + viewport for every screen.
   G2-BEST: Mukta variable (Latin+Devanagari parity, dossier-E §3.1); server component,
   zero JS. Font-scale via html[data-fs] set by a tiny client island (FontScaleButtons).
   G3-FUTURE: L blast-radius; structure frozen for sprint. */

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IRCTC Reborn · यात्रा",
  description: "A citizen-first rebuild of India's train booking experience — demo with synthetic data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B4DDB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mukta.variable}>
      <body className="min-h-dvh flex flex-col" style={{ fontFamily: "var(--font-mukta), system-ui, sans-serif" }}>
        <header className="sticky top-0 z-20 bg-primary text-white shadow-sm">
          <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg leading-tight">
              IRCTC Reborn <span lang="hi" className="opacity-90">· यात्रा</span>
            </a>
            <span className="text-xs bg-white/15 rounded-full px-2 py-0.5">demo</span>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-md px-4 pb-24">{children}</main>

        <footer className="fixed bottom-0 inset-x-0 z-10 border-t border-surface-3 bg-surface/95 backdrop-blur">
          <div className="mx-auto max-w-md px-4 py-2 flex items-center justify-between text-sm">
            <a href="/how-it-works" className="inline-flex items-center gap-2 rounded-full bg-surface-3 px-3 py-1">
              🧪 Demo build · synthetic data
            </a>
            <a href="/how-it-works" className="underline underline-offset-2">how-it-works</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
