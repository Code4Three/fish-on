/**
 * Configuration for Tide & Solunar Hourly Scoring Engine (V1)
 *
 * Defines default weights, visual tier thresholds, and types for the parametric
 * conditions scoring model supporting future domain calibration.
 */

/**
 * Weighting configuration for combining tide and solunar signals.
 * Must satisfy: tide + solunar = 1.0
 */
export interface ConditionWeights {
  tide: number;
  solunar: number;
}

/**
 * Visual tier classification for hourly condition cells.
 * - TOP: 80–100 (Peak Window, high-visibility shading)
 * - MID: 50–79 (Favorable Window, moderate shading)
 * - NEUTRAL: 0–49 (Low/Neutral, default/unshaded)
 */
export type ScoreTier = 'TOP' | 'MID' | 'NEUTRAL';

/**
 * Default weighting for V1 heuristic model.
 * Tide receives 60% weight, Solunar receives 40% weight.
 */
export const DEFAULT_CONDITION_WEIGHTS: ConditionWeights = {
  tide: 0.6,
  solunar: 0.4,
};

/**
 * Visual tier thresholds (inclusive lower bound, exclusive upper bound for tiers).
 * Scores are mapped to tiers as follows:
 * - 80–100: TOP_TIER
 * - 50–79: MID_TIER
 * - 0–49: NEUTRAL_TIER
 */
export const TOP_TIER_MIN = 80;
export const MID_TIER_MIN = 50;
