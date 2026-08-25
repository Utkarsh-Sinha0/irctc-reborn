"use client";
/* G1-WHY: LangToggle (M33) — persistent EN|हिं switch. Sets html[data-lang]; golden-path
 * screens read it via useLang() to swap key strings. Simple dictionary, no framework.
 * G2-BEST: localStorage persistence; zero re-render of server components.
 * G3-FUTURE: M blast-radius — more strings join the dict as screens adopt it. */
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

type Lang = "en" | "hi";
const LangCtx = createContext<{ lang: Lang; t: (en: string, hi: string) => string }>({
  lang: "en",
  t: en => en,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("yatra-lang") as Lang) ?? null;
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
        className="min-h-8 rounded-md border border-white/40 px-2 text-xs font-bold">
        {lang === "en" ? "हिं" : "EN"}
      </button>
      <span className="hidden">{children}</span>
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
