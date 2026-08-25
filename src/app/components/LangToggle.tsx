"use client";
/* G1-WHY: LangToggle (M33) — persistent EN|हिं pill. Sets html[data-lang]; consumers use
 * useLang() to swap key strings. G2-BEST: localStorage + navigator.language default.
 * G3-FUTURE: M — more strings join as screens adopt it. */
import { createContext, useContext, useEffect, useState } from "react";

type Lang = "en" | "hi";
const LangCtx = createContext<{ lang: Lang; t: (en: string, hi: string) => string }>({
  lang: "en",
  t: en => en,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("yatra-lang") as Lang | null;
      const initial = saved ?? ((navigator.language || "").startsWith("hi") ? "hi" : "en");
      setLang(initial);
      document.documentElement.dataset.lang = initial;
    } catch { /* noop */ }
  }, []);

  function toggle() {
    const next: Lang = lang === "en" ? "hi" : "en";
    setLang(next);
    document.documentElement.dataset.lang = next;
    try { localStorage.setItem("yatra-lang", next); } catch { /* noop */ }
  }

  return (
    <LangCtx.Provider value={{ lang, t: (en, hi) => (lang === "hi" ? hi : en) }}>
      <button onClick={toggle} aria-label={`Switch language to ${lang === "en" ? "Hindi" : "English"}`}
        className="min-h-9 rounded-md border border-white/40 px-2.5 text-xs font-bold hover:bg-white/10">
        {lang === "en" ? "हिंदी" : "EN"}
      </button>
      <span className="hidden">{children}</span>
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}

/** Standalone button for places outside the provider (header uses provider internally). */
export default function LangToggle() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yatra-lang") as Lang | null;
      const initial = saved ?? ((navigator.language || "").startsWith("hi") ? "hi" : "en");
      setLang(initial);
      document.documentElement.dataset.lang = initial;
    } catch { /* noop */ }
  }, []);
  function toggle() {
    const next: Lang = lang === "en" ? "hi" : "en";
    setLang(next);
    document.documentElement.dataset.lang = next;
    try { localStorage.setItem("yatra-lang", next); } catch { /* noop */ }
  }
  return (
    <button onClick={toggle} aria-label={`Switch language to ${lang === "en" ? "Hindi" : "English"}`}
      className="min-h-9 rounded-md border border-white/40 px-2.5 text-xs font-bold hover:bg-white/10">
      {lang === "en" ? "हिंदी" : "EN"}
    </button>
  );
}
