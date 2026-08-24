"use client";
/* G1-WHY: Read-aloud PNR (M39) — Elder-mode accessibility (doc 10 M6). SpeechSynthesis
 * speaks PNR digits slowly; stop control; no external TTS dependency.
 * G2-BEST: Web Speech API = zero payload; degrades gracefully if unsupported.
 * G3-FUTURE: S. */
import { useEffect, useState } from "react";

export default function ReadAloudPNR({ pnr }: { pnr: string }) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);

  function speak() {
    const u = new SpeechSynthesisUtterance(pnr.split("").join(" "));
    u.lang = "en-IN";
    u.rate = 0.85;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  if (!supported) return null;

  return speaking ? (
    <button onClick={stop} className="min-h-12 rounded-xl bg-surface-3 px-4 font-semibold text-primary-dark">
      ⏹ Stop reading
    </button>
  ) : (
    <button onClick={speak} className="min-h-12 rounded-xl bg-surface-3 px-4 font-semibold text-primary-dark">
      🔊 Read PNR aloud
    </button>
  );
}
