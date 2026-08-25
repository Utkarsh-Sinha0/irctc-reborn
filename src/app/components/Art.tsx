"use client";
/* G1-WHY: SVG transition components (owner directive) — beautiful, lightweight,
 * reduced-motion-safe visuals for searching / booking confirmation moments.
 * G2-BEST: pure SVG + CSS animations (no video payload); train moves along track;
 * ticket stamps in with 3D flip. Compositor-friendly (transform/opacity only).
 * The India-route Vande Bharat scene lives in IndiaRouteArt.tsx and is re-exported here
 * so callers have a single import site.
 * G3-FUTURE: S — drop-in <SearchingArt/> or <ConfirmedArt/> anywhere. */
export { IndiaRouteArt } from "@/app/components/IndiaRouteArt";


export function SearchingArt({ label = "Scanning live seats across every quota…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-10" role="img" aria-label={label}>
      <svg width="320" height="140" viewBox="0 0 320 140" fill="none" aria-hidden className="max-w-full">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EDF2FA" /><stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="trainG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1359D1" /><stop offset="1" stopColor="#0B2E6F" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="140" rx="16" fill="url(#skyG)" />

        {/* clouds */}
        <g className="art-drift-slow">
          <ellipse cx="60" cy="30" rx="26" ry="9" fill="#FFFFFF" opacity=".9" />
          <ellipse cx="250" cy="22" rx="20" ry="7" fill="#FFFFFF" opacity=".8" />
        </g>

        {/* hills */}
        <path d="M0 108 Q80 84 160 104 T320 100 V140 H0 Z" fill="#DFE8F6" />
        <path d="M0 118 Q120 98 220 114 T320 112 V140 H0 Z" fill="#CFDDF2" opacity=".8" />

        {/* track */}
        <rect x="10" y="122" width="300" height="3" rx="1.5" fill="#B9C7DE" />
        {Array.from({ length: 15 }).map((_, i) => (
          <rect key={i} x={14 + i * 20} y="126" width="12" height="2.5" rx="1" fill="#C9D4E8"
            className="art-track-tie" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}

        {/* moving train: engine + 2 coaches */}
        <g className="art-train-run">
          {/* coach */}
          <rect x="-96" y="92" width="70" height="30" rx="8" fill="url(#trainG)" opacity=".85" />
          <rect x="-88" y="99" width="16" height="11" rx="2" fill="#EAF1FD" />
          <rect x="-66" y="99" width="16" height="11" rx="2" fill="#EAF1FD" />
          <circle cx="-80" cy="124" r="5" fill="#17233B" /><circle cx="-46" cy="124" r="5" fill="#17233B" />
          {/* engine */}
          <rect x="-18" y="86" width="86" height="36" rx="10" fill="url(#trainG)" />
          <path d="M68 96 h14 a8 8 0 0 1 8 8 v18 h-22 z" fill="#0B2E6F" />
          <rect x="-10" y="94" width="20" height="13" rx="2.5" fill="#EAF1FD" />
          <rect x="16" y="94" width="20" height="13" rx="2.5" fill="#EAF1FD" />
          <rect x="44" y="94" width="18" height="13" rx="2.5" fill="#EAF1FD" />
          <rect x="8" y="76" width="10" height="12" rx="2" fill="#F26522" />
          <circle cx="0" cy="126" r="7" fill="#17233B" /><circle cx="28" cy="126" r="7" fill="#17233B" />
          <circle cx="56" cy="126" r="7" fill="#17233B" /><circle cx="82" cy="126" r="7" fill="#17233B" />
          <circle cx="0" cy="126" r="2.4" fill="#8FA3C8" /><circle cx="28" cy="126" r="2.4" fill="#8FA3C8" />
          <circle cx="56" cy="126" r="2.4" fill="#8FA3C8" /><circle cx="82" cy="126" r="2.4" fill="#8FA3C8" />
          {/* steam puffs */}
          <g fill="#FFFFFF" opacity=".85">
            <circle className="art-puff" cx="13" cy="72" r="5" style={{ animationDelay: "0s" }} />
            <circle className="art-puff" cx="13" cy="72" r="7" style={{ animationDelay: "0.35s" }} />
            <circle className="art-puff" cx="13" cy="72" r="9" style={{ animationDelay: "0.7s" }} />
          </g>
        </g>

        {/* scanning dots on right */}
        <g>
          {[0, 1, 2].map(i => (
            <circle key={i} cx={296} cy={34 + i * 12} r="3.2" fill="#1359D1"
              className="art-blink" style={{ animationDelay: `${i * 0.22}s` }} />
          ))}
        </g>
      </svg>
      <p className="mt-1 text-sm font-medium opacity-75">{label}</p>
    </div>
  );
}

export function ConfirmedArt({ small = false }: { small?: boolean }) {
  const s = small ? 0.72 : 1;
  return (
    <div className="grid place-items-center" role="img" aria-label="Ticket confirmed">
      <svg width={340 * s} height={150 * s} viewBox="0 0 340 150" fill="none" aria-hidden>
        <defs>
          <linearGradient id="confettiA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F26522" /><stop offset="1" stopColor="#FF9933" />
          </linearGradient>
          <linearGradient id="ticketFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EFF4FC" />
          </linearGradient>
        </defs>

        {/* radiating rays */}
        <g className="art-rays" transform="translate(170 78)">
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = (i * 30 * Math.PI) / 180;
            return (
              <line key={i}
                x1={Math.cos(ang) * 52} y1={Math.sin(ang) * 52}
                x2={Math.cos(ang) * (64 + (i % 3) * 6)} y2={Math.sin(ang) * (64 + (i % 3) * 6)}
                stroke="#F26522" strokeWidth="3" strokeLinecap="round" opacity=".55" />
            );
          })}
        </g>

        {/* confetti */}
        <g>
          {[[36, 24, "#1B7F4D"], [300, 30, "#1359D1"], [58, 118, "#F26522"], [286, 116, "#1B7F4D"],
            [130, 14, "#1359D1"], [222, 12, "#F26522"]].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width="9" height="5" rx="1.5" fill={c as string}
              className="art-confetti" style={{ animationDelay: `${i * 0.09}s`, transformOrigin: `${x}px ${y}px` } as React.CSSProperties} />
          ))}
        </g>

        {/* 3D-ish ticket (isometric stack) */}
        <g transform="translate(96 40)">
          <rect x="10" y="14" width="138" height="62" rx="10" fill="#0B2E6F" opacity=".18" transform="translate(6 8)" />
          <rect x="0" y="0" width="138" height="62" rx="10" fill="url(#ticketFace)" stroke="#C7D4EA" strokeWidth="1.5"
            className="art-ticket-pop" style={{ transformOrigin: "69px 31px" }} />
          {/* punched notches */}
          <circle cx="0" cy="31" r="7" fill="#F5F7FB" stroke="#C7D4EA" strokeWidth="1.5" />
          <circle cx="138" cy="31" r="7" fill="#F5F7FB" stroke="#C7D4EA" strokeWidth="1.5" />
          <line x1="104" y1="6" x2="104" y2="56" stroke="#C7D4EA" strokeDasharray="4 4" />
          <text x="14" y="24" fontSize="11" fontWeight="700" fill="#0B2E6F">PNR 44218·76503</text>
          <text x="14" y="42" fontSize="10" fill="#17233B" opacity=".75">PUNE → NDLS · 3A</text>
          <text x="14" y="54" fontSize="9" fill="#1B7F4D" fontWeight="700">✓ CONFIRMED · S4/12 LB</text>
          <text x="112" y="42" fontSize="9" fontFamily="monospace" fill="#17233B" opacity=".65">▌▌▐│▌▖</text>
        </g>

        {/* check seal */}
        <g transform="translate(238 58)">
          <circle className="art-seal" r="24" fill="#1B7F4D" style={{ transformOrigin: "0px 0px" }} />
          <circle r="19" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity=".9" />
          <path d="M-9 1 L-2 8 L11 -7" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            className="art-check-draw" />
        </g>
      </svg>
    </div>
  );
}

export function BookingShimmer() {
  return <SearchingArt label="Reserving your seats…" />;
}
