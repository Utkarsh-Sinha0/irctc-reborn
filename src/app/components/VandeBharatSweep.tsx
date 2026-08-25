"use client";
/* G1-WHY: VandeBharatSweep (owner directive v2) — clean side-profile OUTLINE of the
 * orange-liveried Vande Bharat nose+coach sweeping right→left across the viewport.
 * Photo-accurate proportions from CC-licensed reference shots (public/vb/*): long low
 * nose (~2.6× body height), wraparound black windshield, orange band under windows,
 * blue-grey roofline, plug doors, roof-mounted pantograph wells.
 * G2-BEST: single <svg> outline, stroke-only (fill on hover), CSS keyframes translateX;
 * reduced-motion = static half-visible train. Zero payload beyond ~4KB path data.
 * G3-FUTURE: S — reuse <VandeBharatSweep/> on any screen. */

const W = 1200;
const H = 240;

/** One coach side profile (body only; wheels drawn separately). Origin: left-bottom. */
function Coach({ x, executive = false }: { x: number; executive?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* body */}
      <rect x="0" y="26" width="150" height="74" rx="10" />
      {/* window strip: 7 windows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={14 + i * 19} y="40" width="13" height="22" rx="2.5" />
      ))}
      {/* orange livery band (below windows, wraps full width) */}
      <rect x="-1" y="70" width="152" height="9" className="vb-orange-band" />
      {/* plug door at coach end */}
      <rect x={executive ? 128 : 132} y="38" width="12" height="52" rx="2" />
      {/* roofline hint */}
      <line x1="6" y1="30" x2="144" y2="30" className="vb-roofline" />
    </g>
  );
}

export default function VandeBharatSweep() {
  return (
    <div className="vb-sweep-stage" role="img"
      aria-label="Outline of a Vande Bharat train gliding right to left across the screen">
      <svg viewBox={`0 0 ${W} ${H}`} className="vb-sweep-svg" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <linearGradient id="vbOrangeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FF9933" /><stop offset="1" stopColor="#F26522" />
          </linearGradient>
        </defs>

        {/* the whole consist: nose car + 4 coaches, drawn as OUTLINE (stroke, no fill) */}
        <g className="vb-consist" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* ── NOSE CAR (facing LEFT, per reference photos) ──
              Long tapered nose ~150 wide; roofline falls from cab to nose tip. */}
          <g>
            {/* roofline → windshield → long nose → anti-climber */}
            <path d="
              M150 26
              L60 26
              C34 26 16 34 8 52
              C3 63 2 78 4 92
              L8 100
              L150 100 Z"
              className="vb-outline" strokeWidth="3" />
            {/* wraparound windshield (black band) */}
            <path d="M96 30 C64 30 34 40 20 58 C16 64 15 70 16 76 L58 76 C70 60 88 48 108 42 C104 34 100 30 96 30 Z"
              className="vb-windshield" strokeWidth="2" />
            {/* headlight cluster */}
            <circle cx="14" cy="86" r="4" className="vb-outline" strokeWidth="2" />
            {/* orange band wrapping the nose skirt */}
            <path d="M4 84 C20 90 60 93 150 93" className="vb-orange-band" strokeWidth="8" fill="none" />
            {/* door behind cab */}
            <rect x="120" y="38" width="12" height="52" rx="2" className="vb-outline" strokeWidth="2" />
            {/* front window on nose tip */}
            <rect x="22" y="80" width="16" height="9" rx="2" className="vb-outline" strokeWidth="1.5" />
          </g>

          {/* ── COACHES ── */}
          <Coach x={160} />
          <Coach x={320} executive />
          <Coach x={480} />
          <Coach x={640} executive />

          {/* ── WHEELS / BOGIES (shared outline style) ── */}
          <g className="vb-outline" strokeWidth="2.5">
            {[36, 66, 196, 226, 356, 386, 516, 546, 676, 706].map((cx, i) => (
              <g key={i}>
                <circle cx={cx} cy="106" r="9" />
                <circle cx={cx} cy="106" r="3" />
              </g>
            ))}
            {/* bogie frames */}
            {[26, 186, 346, 506, 666].map((bx, i) => (
              <rect key={i} x={bx} y="100" width="50" height="4" rx="2" />
            ))}
          </g>

          {/* ── PANTOGRAPH (on 2nd coach roof) ── */}
          <g className="vb-outline" strokeWidth="2">
            <path d="M395 26 L410 8 L426 8 M402 26 L417 10" />
            <line x1="402" y1="8" x2="432" y2="8" strokeWidth="3" />
          </g>
        </g>

        {/* track line the train rides */}
        <line x1="0" y1="118" x2={W} y2="118" className="vb-track" strokeWidth="3" />
        <line x1="0" y1="126" x2={W} y2="126" className="vb-track-thin" strokeWidth="1.5" strokeDasharray="18 14" />
      </svg>
    </div>
  );
}
