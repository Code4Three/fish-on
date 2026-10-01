/**
 * Tide & Solunar Hourly Scoring Engine (V1)
 *
 * Pure business logic for calculating combined condition scores using parametric
 * weighting. No UI dependencies.
 *
 * Formula: Final Score = (T × W_tide) + (S × W_solunar)
 * Where T = tide rating [0-100], S = solunar rating [0-100]
 */

import type {
  ConditionWeights,
  ScoreTier,
} from './config';
import {
  DEFAULT_CONDITION_WEIGHTS,
  TOP_TIER_MIN,
  MID_TIER_MIN,
} from './config';

/**
 * Result of hourly condition scoring.
 */
export interface ScoreResult {
  /** Calculated score (0–100, rounded to integer) */
  score: number;
  /** Visual tier for UI shading */
  tier: ScoreTier;
}

/**
 * Validates that provided weights sum to 1.0 (within floating-point tolerance).
 * Throws an error if validation fails.
 *
 * @param weights - Tide and solunar weighting coefficients
 * @throws If weights do not sum to 1.0 (tolerance: ±0.000001)
 */
function validateWeights(weights: ConditionWeights): void {
  const sum = weights.tide + weights.solunar;
  const tolerance = 0.000001;

  if (Math.abs(sum - 1.0) > tolerance) {
    throw new Error(
      `Condition weights (tide: ${weights.tide}, solunar: ${weights.solunar}) must sum to 1.0`,
    );
  }
}

/**
 * Maps a raw score [0-100] to a discrete visual tier.
 *
 * @param score - Raw score value (0–100)
 * @returns Visual tier for UI shading
 */
function calculateTierFromScore(score: number): ScoreTier {
  if (score >= TOP_TIER_MIN) {
    return 'TOP';
  }
  if (score >= MID_TIER_MIN) {
    return 'MID';
  }
  return 'NEUTRAL';
}

/**
 * Normalizes a rating value to the [0, 100] range.
 * Treats null/undefined as 0 (neutral rating).
 *
 * @param rating - Raw rating value
 * @returns Normalized rating [0-100]
 */
function normalizeRating(rating: number | null | undefined): number {
  if (typeof rating !== 'number' || !Number.isFinite(rating)) {
    return 0;
  }
  return Math.max(0, Math.min(100, rating));
}

/**
 * Calculates combined hourly condition score from tide and solunar ratings.
 *
 * Applies the parametric formula:
 *   Score = (tideRating × W_tide) + (solunarRating × W_solunar)
 *
 * Inputs are clamped to [0, 100]. Null/undefined inputs default to 0.
 * Weights must sum to 1.0 or an error is thrown.
 *
 * @param tideRating - Tide condition rating [0-100]
 * @param solunarRating - Solunar condition rating [0-100]
 * @param weights - Optional custom weighting (default: 0.60 tide / 0.40 solunar)
 * @returns Calculated score and visual tier
 * @throws If provided weights do not sum to 1.0
 *
 * @example
 * // Peak conditions (both 100)
 * calculateHourlyScore(100, 100)
 * // => { score: 100, tier: 'TOP' }
 *
 * @example
 * // Neutral solunar period
 * calculateHourlyScore(80, 0)
 * // => { score: 48, tier: 'NEUTRAL' }
 *
 * @example
 * // Custom weights (80/20)
 * calculateHourlyScore(100, 50, { tide: 0.8, solunar: 0.2 })
 * // => { score: 90, tier: 'TOP' }
 */
export function calculateHourlyScore(
  tideRating: number | null | undefined,
  solunarRating: number | null | undefined,
  weights: ConditionWeights = DEFAULT_CONDITION_WEIGHTS,
): ScoreResult {
  // Validate weights
  validateWeights(weights);

  // Normalize inputs
  const normalizedTide = normalizeRating(tideRating);
  const normalizedSolunar = normalizeRating(solunarRating);

  // Calculate score using parametric formula
  const rawScore = normalizedTide * weights.tide + normalizedSolunar * weights.solunar;

  // Round to integer and clamp to [0, 100]
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // Determine visual tier
  const tier = calculateTierFromScore(score);

  return { score, tier };
}
