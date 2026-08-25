"use client";
/* G1-WHY: Vande Bharat India-route hero (owner directive) — translucent green→white
 * gradient map of India; two white-and-blue Vande Bharat sets rise from Kashmir and
 * the North-East, curve toward the viewer, then sweep down to Kanyakumari / West.
 * Pure SVG + CSS keyframes (no video payload); reduced-motion collapses to a static map.
 * G2-BEST: single coordinate space 400×460 (roughly India's aspect); routes as paths;
 * trains = offset-motion along path via CSS offset-path (broad support, GPU-composited).
 * G3-FUTURE: S — drop <IndiaRouteArt/> anywhere. */

/** Path data (approximate, stylized): Kashmir→tip and NE→Gujarat, both curving "up" toward viewer mid-way. */
const PATH_KASHMIR =
  "M196 44 C210 92 172 128 178 178 C184 226 150 258 158 306 C164 346 176 388 186 420";
const PATH_NE_WEST =
  "M292 208 C258 232 236 250 214 262 C182 280 138 272 108 288 C86 300 66 310 52 316";

export function IndiaRouteArt({ compact = false }: { compact?: boolean }) {
  const w = compact ? 320 : 430;
  return (
    <div className="grid place-items-center" role="img"
      aria-label="Map of India with two Vande Bharat trains: one from Kashmir to Kanyakumari, one from the North-East to Gujarat">
      <svg width={w} height={w * 1.15} viewBox="0 0 400 460" fill="none" aria-hidden className="max-w-full">
        <defs>
          {/* translucent green → white body of the map */}
          <linearGradient id="indiaBody" x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#1B7F4D" stopOpacity=".34" />
            <stop offset=".45" stopColor="#2FA36A" stopOpacity=".20" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity=".10" />
          </linearGradient>
          <linearGradient id="vbWhite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#DCE7F9" />
          </linearGradient>
          <linearGradient id="glowOrange" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F26522" /><stop offset="1" stopColor="#FF9933" />
          </linearGradient>
          {/* route draw-on */}
          <path id="routeKashmir" d={PATH_KASHMIR} />
          <path id="routeNeWest" d={PATH_NE_WEST} />
        </defs>

        {/* ── INDIA LANDMASS (stylized) ── */}
        <g opacity=".96">
          {/* mainland silhouette: Kashmir top → Gujarat west → Bengal east → tip at Kanyakumari */}
          <path
            d="M188 30
               C204 24 216 32 214 46
               C230 54 240 70 236 88
               C260 96 286 112 300 134
               C312 154 330 168 340 190
               C352 214 366 222 372 238
               C360 246 344 246 332 252
               C318 258 308 270 296 268
               C300 292 292 314 278 332
               C262 352 240 368 224 392
               C212 410 202 432 196 452
               C190 432 180 412 168 396
               C148 370 122 350 106 322
               C94 300 84 276 72 258
               C58 236 40 228 34 206
               C48 200 64 202 78 194
               C96 184 104 166 120 156
               C136 146 152 142 160 126
               C168 110 162 92 170 74
               C176 60 180 44 188 30 Z"
            fill="url(#indiaBody)"
            stroke="#1B7F4D"
            strokeOpacity=".55"
            strokeWidth="2.5"
          />
          {/* subtle interior graticule dots for texture */}
          <g fill="#1B7F4D" opacity=".18">
            {[[150, 120], [220, 140], [130, 210], [250, 210], [180, 260], [230, 290],
              [160, 320], [205, 360], [185, 415], [110, 250], [300, 235]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.4" />
            ))}
          </g>
          {/* endpoint labels */}
          <g fontSize="11.5" fontWeight="700" fill="#0B2E6F" opacity=".85">
            <text x="222" y="40">Kashmir</text>
            <text x="118" y="447">Kanyakumari</text>
            <text x="330" y="200" textAnchor="end">NE</text>
            <text x="40" y="336" textAnchor="start">Gujarat</text>
          </g>
        </g>

        {/* ── ROUTES (drawn on) ── */}
        {/* Kashmir → Kanyakumari */}
        <use href="#routeKashmir" stroke="#1359D1" strokeWidth="5" strokeLinecap="round" opacity=".18" />
        <path d={PATH_KASHMIR} stroke="url(#glowOrange)" strokeWidth="4" strokeLinecap="round"
          fill="none" pathLength={1} className="art-route-draw" style={{ animationDelay: ".2s" }} />
        {/* NE → Gujarat */}
        <use href="#routeNeWest" stroke="#1359D1" strokeWidth="5" strokeLinecap="round" opacity=".18" />
        <path d={PATH_NE_WEST} stroke="url(#glowOrange)" strokeWidth="4" strokeLinecap="round"
          fill="none" pathLength={1} className="art-route-draw" style={{ animationDelay: ".55s" }} />

        {/* station pips at endpoints */}
        <g fill="#FFFFFF" stroke="#0B2E6F" strokeWidth="2">
          {[[196, 44], [186, 420], [292, 208], [52, 316]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" />
          ))}
        </g>

        {/* ══ TRAIN 1: Kashmir → Kanyakumari ══
            offset-path carries the whole consist; cars trail behind on the same path
            using negative delays. The "rise toward screen" is a scale-up mid-route
            baked into keyframes (art-vb-run scales .55→1.15→.8). */}
        <g className="art-vb-consist art-vb-run-a" style={{ offsetPath: `path("${PATH_KASHMIR}")` } as React.CSSProperties}>
          <VandeBharatSet />
        </g>

        {/* ══ TRAIN 2: NE → Gujarat ══ */}
        <g className="art-vb-consist art-vb-run-b" style={{ offsetPath: `path("${PATH_NE_WEST}")` } as React.CSSProperties}>
          <VandeBharatSet flip />
        </g>

        {/* arrival pulses */}
        <circle cx="186" cy="420" r="6" fill="#F26522" className="art-arrive-pulse" style={{ animationDelay: "2.6s" }} />
        <circle cx="52" cy="316" r="6" fill="#F26522" className="art-arrive-pulse" style={{ animationDelay: "2.9s" }} />
      </svg>
    </div>
  );
}

/** White-bodied Vande Bharat set: nose car + 2 coaches, blue band, pantograph. */
function VandeBharatSet({ flip = false }: { flip?: boolean }) {
  return (
    <g transform={flip ? "scale(-1,1)" : undefined} className="drop-shadow-[0_3px_4px_rgba(11,46,111,.35)]">
      {/* trailing coaches (drawn first so nose overlaps) */}
      {[34, 62].map((x, i) => (
        <g key={x} transform={`translate(${-x - 30} ${i === 0 ? -13 : -13})`}>
          <rect width="30" height="17" rx="5" fill="url(#vbWhite)" stroke="#9FB4D8" strokeWidth="1" />
          <rect x="3" y="4" width="24" height="4.5" rx="1.5" fill="#1359D1" opacity=".85" />
          <rect x="-1" y="6" width="3" height="6" fill="#C7D4EA" />
          <rect x="28" y="6" width="3" height="6" fill="#C7D4EA" />
        </g>
      ))}
      {/* nose car — signature VB snout */}
      <g transform="translate(-30 -14)">
        <path d="M0 0 h26 c8 0 14 3 18 8 l6 7 c1 1.6 0 4-2.5 4 H4 A4 4 0 0 1 0 15 Z"
          fill="url(#vbWhite)" stroke="#9FB4D8" strokeWidth="1" />
        {/* windshield */}
        <path d="M30 3 c5 .5 9 2.6 12 6 l3 3.5 h-15 z" fill="#17233B" opacity=".85" />
        {/* blue livery stripe along skirt */}
        <rect x="0" y="12" width="49" height="3.4" fill="#1359D1" />
        {/* orange accent (livery hint) */}
        <rect x="0" y="15.4" width="49" height="1.6" fill="#F26522" opacity=".9" />
        {/* headlight */}
        <circle cx="45" cy="11" r="1.8" fill="#FF9933" />
        {/* pantograph */}
        <path d="M8 -1 l5 -6 h6" stroke="#5B6B8C" strokeWidth="1.4" fill="none" />
      </g>
    </g>
  );
}
