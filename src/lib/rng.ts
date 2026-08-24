/**
 * G1-WHY: seeded deterministic RNG — the entire demo plane's trust story depends on
 * identical data across judge visits (PRD §4.1) and the CI seed-hash test (edge H5).
 * G2-BEST: mulberry32 — 8 lines, no dependency, well-distributed for fixture use.
 * Rejected: crypto RNG (non-deterministic), seed libraries (dep weight, G2 law 4).
 * G3-FUTURE: blast-radius L. Every factory takes `seed` as first arg; swapping impl
 * would change all hashes once, in one place. Never call Math.random in app code.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable string hash → numeric seed (fixture keys like "priya:tatkal-rush") */
export function hashSeed(key: string): number {
  let h = 1779033703 ^ key.length;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}

/** Convenience: rng-picked element */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
