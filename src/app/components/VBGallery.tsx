"use client";
/* G1-WHY: rotating VB gallery (owner directive: aesthetic images as backgrounds).
 * Local CC-licensed assets, crossfade every 4s, dots for manual control.
 * G2-BEST: opacity-only transitions (GPU); preloaded via <link> in layout head.
 * G3-FUTURE: S. */
import { useEffect, useState } from "react";

const SHOTS = [
  { src: "/vb/amritsar.jpg", alt: "Vande Bharat at Amritsar Junction, morning light" },
  { src: "/vb/dharwad.jpg", alt: "Vande Bharat KSR Bengaluru–Dharwad" },
  { src: "/vb/executive.jpg", alt: "Vande Bharat executive class coach interior" },
  { src: "/vb/nose.jpg", alt: "Vande Bharat nose close-up at Anand Vihar" },
];

export default function VBGallery() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % SHOTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="vb-gallery" role="img" aria-label={SHOTS[i].alt}>
      {SHOTS.map((s, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s.src} src={s.src} alt="" className={idx === i ? "on" : ""} />
      ))}
      <p className="absolute bottom-2 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white">
        {SHOTS[i].alt} · CC BY-SA via Wikimedia
      </p>
      <div className="absolute bottom-2 left-3 flex gap-1">
        {SHOTS.map((_, idx) => (
          <button key={idx} aria-label={`Show photo ${idx + 1}`} onClick={() => setI(idx)}
            className={`h-1.5 w-5 rounded-full transition ${idx === i ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
