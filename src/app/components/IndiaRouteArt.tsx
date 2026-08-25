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
  "M95.1 67.0 C113.1 137.0, 115.1 187.0, 125.1 247.0 C133.1 317.0, 121.1 387.0, 131.1 435.6";
const PATH_NE_WEST =
  "M317.6 179.6 C267.6 209.6, 128.5 174.9, 18.5 234.9";

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
            d="M130.9 47.1 L136.0 47.4 L136.4 46.0 L139.3 46.1 L140.4 43.7 L147.7 41.6 L148.5 40.1 L150.7 41.0 L154.9 39.9 L156.8 41.9 L157.9 41.2 L159.6 44.9 L163.5 45.4 L164.2 47.9 L166.2 45.8 L168.9 47.2 L167.3 48.9 L166.2 55.5 L164.5 58.1 L160.7 59.2 L160.8 61.3 L157.1 61.7 L158.3 64.8 L155.7 68.1 L148.9 68.5 L151.5 73.3 L149.1 73.5 L149.6 76.9 L151.8 79.5 L155.7 79.6 L154.7 82.3 L157.6 86.9 L155.8 89.1 L154.0 88.6 L149.9 91.7 L147.5 89.7 L146.9 86.6 L142.4 89.0 L143.6 92.6 L147.5 96.6 L146.4 99.2 L148.3 102.0 L146.7 103.5 L147.4 106.2 L149.0 106.6 L151.7 104.2 L156.0 110.3 L158.3 111.5 L161.7 111.1 L166.6 114.0 L166.4 116.6 L177.1 121.3 L168.3 128.4 L168.9 130.6 L166.7 132.7 L167.4 136.1 L165.4 137.6 L164.5 141.5 L170.3 145.4 L171.0 143.5 L179.4 148.1 L180.8 151.3 L182.5 150.9 L188.3 155.2 L190.7 154.3 L195.7 157.8 L199.1 157.1 L199.5 160.3 L205.4 160.9 L207.1 162.7 L208.1 160.6 L214.3 162.5 L214.1 161.1 L218.1 160.1 L219.9 161.9 L224.2 162.6 L224.6 166.7 L228.8 168.0 L229.6 169.5 L231.8 169.2 L232.0 170.8 L237.5 169.2 L240.4 173.5 L242.7 172.1 L246.8 172.8 L252.0 175.6 L256.5 173.3 L256.7 175.2 L260.0 176.6 L267.2 174.7 L268.8 176.4 L271.1 171.1 L270.5 167.6 L268.5 165.7 L271.3 156.2 L270.2 154.4 L277.1 151.5 L279.7 153.0 L280.4 155.2 L278.7 159.4 L280.7 163.3 L278.5 165.4 L280.1 165.8 L280.2 168.2 L280.8 167.5 L283.6 170.1 L286.8 169.3 L293.2 171.6 L299.7 168.8 L304.4 170.7 L317.2 170.1 L319.9 168.5 L322.0 169.6 L322.9 167.9 L321.8 163.7 L322.9 163.3 L321.5 160.6 L316.7 160.5 L315.5 158.4 L316.6 156.6 L320.3 157.2 L324.5 154.8 L327.3 156.1 L330.9 153.5 L330.2 151.1 L333.4 150.4 L337.7 145.5 L347.8 142.0 L352.4 138.7 L351.4 136.9 L356.7 134.5 L358.2 136.7 L364.2 138.1 L373.4 133.7 L377.4 135.6 L377.8 136.9 L376.3 138.5 L378.2 137.4 L382.4 143.4 L379.2 146.0 L380.4 147.1 L380.4 145.5 L383.2 144.5 L386.0 148.2 L388.7 148.1 L391.8 150.3 L392.0 154.7 L390.3 154.6 L385.6 158.8 L385.7 161.0 L389.1 165.6 L385.4 164.8 L385.5 163.7 L383.1 162.1 L376.9 163.4 L366.4 171.6 L362.7 172.8 L361.5 175.2 L363.2 180.5 L360.9 183.0 L361.4 185.0 L359.4 187.7 L355.9 190.1 L355.1 192.7 L357.3 194.0 L357.0 196.7 L352.8 203.1 L349.6 212.1 L344.3 209.9 L341.1 210.7 L338.7 208.8 L340.2 214.4 L339.5 222.2 L338.3 224.0 L336.1 223.5 L335.8 230.8 L337.1 234.5 L336.4 235.8 L334.9 235.5 L334.4 238.6 L333.8 237.9 L333.2 239.1 L330.5 236.1 L329.2 238.6 L325.0 213.9 L321.9 215.0 L320.7 213.7 L320.9 217.3 L318.1 219.9 L319.1 222.8 L316.3 225.0 L314.1 220.4 L313.1 221.2 L313.6 223.2 L312.7 222.7 L312.3 219.0 L310.2 215.4 L313.1 208.4 L315.8 208.9 L316.9 206.6 L318.2 207.9 L317.9 206.4 L320.0 208.0 L320.2 205.2 L323.4 204.0 L325.2 199.5 L324.3 197.2 L327.8 197.5 L326.9 195.3 L322.1 193.1 L300.8 193.7 L292.9 191.6 L292.6 184.2 L293.5 182.3 L290.8 178.2 L289.4 182.0 L286.5 181.5 L283.9 179.6 L283.0 175.9 L280.6 175.8 L282.5 178.1 L277.4 177.8 L278.5 176.6 L273.9 172.7 L273.0 174.7 L275.1 175.0 L275.6 176.5 L271.0 179.5 L270.1 184.2 L272.2 184.3 L275.8 188.5 L279.3 188.3 L279.7 190.6 L281.9 192.0 L280.8 193.4 L274.5 192.8 L273.9 196.5 L273.0 197.6 L270.5 196.7 L271.0 197.7 L268.8 200.5 L273.1 204.5 L278.4 206.0 L278.8 210.2 L276.3 211.9 L276.0 214.9 L279.2 217.1 L278.1 220.5 L281.8 221.1 L279.8 224.0 L281.4 226.3 L281.0 230.3 L283.1 236.1 L281.6 239.8 L283.1 243.4 L280.8 243.5 L280.0 241.5 L279.9 243.7 L278.2 242.9 L278.9 238.1 L277.1 237.2 L276.0 240.9 L275.5 239.0 L274.7 239.8 L274.6 243.8 L274.3 242.3 L273.9 244.1 L274.0 242.3 L272.3 242.1 L271.9 244.5 L270.7 238.9 L271.4 236.2 L268.9 235.1 L271.2 236.8 L266.1 242.6 L256.8 244.9 L254.4 247.7 L253.3 250.5 L255.2 255.0 L253.8 255.7 L256.5 256.4 L252.0 259.1 L251.7 260.9 L252.8 261.3 L251.3 262.5 L252.9 261.7 L249.2 264.0 L247.9 266.6 L246.5 266.8 L247.3 267.3 L236.3 271.0 L229.7 275.3 L217.8 290.6 L210.3 294.6 L205.8 300.8 L193.8 308.6 L193.1 311.0 L194.5 311.7 L194.2 309.4 L194.7 310.5 L193.3 313.4 L194.6 313.3 L193.9 314.9 L193.2 313.6 L193.8 315.4 L186.0 319.0 L183.9 318.1 L180.2 319.2 L175.8 327.5 L174.4 327.6 L174.1 325.6 L172.4 324.9 L167.0 328.0 L164.1 336.5 L166.1 343.5 L165.2 350.8 L168.1 361.9 L165.6 373.5 L161.8 379.5 L160.3 384.7 L161.9 404.2 L156.4 403.5 L157.3 404.0 L154.0 405.0 L153.9 407.9 L149.1 415.7 L149.8 417.8 L152.8 418.7 L148.5 419.1 L140.7 422.4 L138.1 431.5 L131.3 435.8 L128.2 435.1 L124.2 431.8 L118.1 424.1 L119.7 422.7 L118.0 423.6 L115.6 417.5 L114.5 408.0 L113.8 408.5 L113.7 405.7 L109.8 397.3 L109.2 392.5 L104.9 384.2 L100.4 380.0 L95.5 368.2 L93.8 361.0 L94.1 356.9 L90.2 347.8 L91.4 348.3 L90.2 347.7 L88.4 341.6 L86.2 340.8 L86.8 339.6 L83.5 336.4 L83.3 332.9 L81.8 331.8 L83.1 331.5 L78.1 324.1 L76.3 318.0 L77.6 317.5 L76.3 317.8 L75.6 316.1 L77.3 316.3 L75.7 314.9 L76.8 314.6 L75.5 313.0 L75.8 309.7 L74.9 308.5 L75.8 308.6 L74.0 305.0 L75.4 305.1 L73.7 303.5 L73.3 301.3 L74.3 300.8 L73.3 300.5 L71.9 295.7 L72.7 295.1 L70.6 291.9 L71.0 291.1 L72.8 293.0 L72.6 290.5 L71.9 291.3 L70.4 290.1 L70.3 287.4 L71.6 288.4 L69.6 285.2 L70.7 283.3 L71.7 284.9 L70.3 282.3 L72.4 280.5 L71.5 280.8 L71.3 278.1 L68.9 282.3 L68.7 276.5 L70.3 276.7 L68.1 274.3 L70.0 273.4 L67.9 273.3 L66.9 269.0 L70.2 259.1 L69.4 256.1 L70.6 255.9 L69.2 255.4 L69.5 252.9 L68.3 253.5 L68.0 252.5 L69.5 252.0 L67.6 251.2 L68.7 249.9 L66.7 251.3 L66.7 249.5 L68.1 249.7 L66.2 248.2 L68.4 246.1 L66.8 246.1 L67.3 245.4 L70.5 242.9 L65.4 243.1 L66.5 239.6 L68.2 238.7 L65.0 239.2 L66.0 235.4 L68.3 235.8 L70.3 234.5 L65.4 234.0 L64.0 235.4 L62.6 233.9 L62.3 236.8 L60.7 238.0 L61.6 239.4 L60.5 238.9 L62.4 243.6 L59.5 248.0 L59.8 249.6 L51.0 254.3 L42.8 256.9 L34.1 251.7 L18.0 233.9 L19.8 231.5 L19.4 232.8 L21.4 232.4 L21.9 234.7 L25.2 233.6 L25.6 232.3 L27.7 233.7 L28.5 231.6 L29.5 232.6 L31.8 230.6 L34.3 230.6 L37.9 224.5 L35.8 224.9 L34.9 223.3 L35.0 224.8 L30.5 225.3 L28.2 227.8 L24.8 227.3 L23.6 225.8 L21.5 226.4 L14.0 221.7 L15.2 222.2 L13.4 220.9 L14.7 219.8 L11.6 217.3 L11.9 216.3 L11.3 216.9 L12.9 214.0 L16.4 211.7 L12.5 213.5 L11.3 212.5 L10.3 215.9 L8.0 215.3 L10.3 213.8 L8.2 213.8 L10.4 210.3 L15.6 210.3 L16.4 205.5 L17.1 206.9 L18.2 205.6 L18.9 206.8 L26.7 205.8 L28.5 207.5 L32.4 207.5 L33.5 205.7 L39.4 204.0 L39.5 206.4 L41.4 206.9 L46.8 204.2 L45.2 203.6 L45.0 201.5 L46.4 200.2 L43.7 193.7 L40.8 190.1 L40.7 185.8 L35.6 185.6 L33.3 182.4 L34.3 173.8 L29.7 173.2 L25.6 171.0 L26.6 164.8 L36.9 153.0 L39.8 153.1 L41.8 156.9 L43.5 157.4 L57.0 153.8 L63.5 142.3 L70.8 138.6 L75.2 130.9 L76.7 125.6 L84.3 122.0 L83.0 119.8 L83.8 117.9 L85.6 117.4 L90.1 111.5 L93.8 109.6 L91.3 108.8 L91.9 105.5 L93.2 104.6 L91.0 100.5 L92.6 98.1 L96.2 95.7 L100.9 95.2 L102.7 93.3 L99.1 89.7 L93.6 89.5 L93.9 84.6 L93.0 85.8 L89.5 85.6 L83.6 81.8 L79.8 81.0 L79.3 69.7 L76.7 62.8 L77.4 60.1 L80.1 60.2 L81.0 57.3 L85.2 55.5 L86.4 52.3 L81.3 50.8 L80.6 49.0 L81.8 46.5 L76.8 46.4 L75.8 44.6 L73.1 43.7 L73.8 41.8 L65.8 41.9 L65.5 36.5 L71.0 33.0 L72.3 29.9 L82.7 29.6 L80.3 26.7 L85.2 27.9 L90.2 25.5 L92.0 26.0 L93.7 24.2 L95.7 24.7 L96.5 26.4 L99.7 25.1 L103.3 26.2 L103.8 29.4 L107.4 29.1 L111.3 33.5 L120.4 37.5 L121.9 41.8 L128.6 43.7 Z"
            fill="url(#indiaBody)"
            stroke="#1B7F4D"
            strokeOpacity=".55"
            strokeWidth="2"
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
            <text x="89.1" y="55.0" textAnchor="end">Kashmir</text>
            <text x="131.1" y="452" textAnchor="start">Kanyakumari</text>
            <text x="325.6" y="173.6" textAnchor="start">North East</text>
            <text x="12.5" y="258.9" textAnchor="end">Gujarat</text>
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
          {[[95.1, 67.0], [131.1, 435.6], [317.6, 179.6], [18.5, 234.9]].map(([cx, cy], i) => (
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
        <circle cx="131.1" cy="435.6" r="6" fill="#F26522" className="art-arrive-pulse" style={{ animationDelay: "2.6s" }} />
        <circle cx="18.5" cy="234.9" r="6" fill="#F26522" className="art-arrive-pulse" style={{ animationDelay: "2.9s" }} />
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
