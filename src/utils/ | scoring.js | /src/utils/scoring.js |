import { CRITERIA, WEIGHTS } from "../constants";

/**
 * Calculate a weighted site score (0–100) based on criteria scores and site type.
 * Each criterion is multiplied by its type-specific weight before averaging.
 *
 * @param {Object} scores  - { acreage, zoning, roads, utilities, schools, competition }
 * @param {string} type    - "Residential" | "Multifamily" | "Commercial"
 * @returns {number}       - Integer 0–100
 */
export function weightedScore(scores, type) {
  const w = WEIGHTS[type] || WEIGHTS.Residential;
  let total = 0;
  let maxTotal = 0;

  CRITERIA.forEach((c) => {
    const score = scores?.[c.key] ?? 3;
    total += score * w[c.key];
    maxTotal += 5 * w[c.key];
  });

  return Math.round((total / maxTotal) * 100);
}

/**
 * Return a color hex string based on score percentage.
 * Green ≥ 72, Yellow ≥ 52, Red below 52.
 */
export function scoreColor(pct) {
  if (pct >= 72) return "#10b981";
  if (pct >= 52) return "#f59e0b";
  return "#ef4444";
}

/**
 * Return a human-readable score tier label.
 */
export function scoreTier(pct) {
  if (pct >= 72) return "Strong";
  if (pct >= 52) return "Conditional";
  return "Weak";
}
