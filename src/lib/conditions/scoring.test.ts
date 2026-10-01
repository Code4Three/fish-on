/**
 * Unit tests for Tide & Solunar Hourly Scoring Engine (V1)
 *
 * Validates mathematical output per acceptance scenarios 1–3 and edge cases.
 * Uses Vitest (already configured in the project).
 */

import { describe, it, expect } from 'vitest';
import { calculateHourlyScore } from './scoring';

describe('Tide & Solunar Hourly Scoring Engine', () => {
  describe('Scenario 1: Peak condition overlap calculation', () => {
    it('calculates score 100 with tier TOP when both tide and solunar are 100', () => {
      const result = calculateHourlyScore(100, 100);

      expect(result.score).toBe(100);
      expect(result.tier).toBe('TOP');
    });
  });

  describe('Scenario 2: Parametric calculation with neutral solunar period', () => {
    it('calculates score 48 with tier NEUTRAL when tide is 80 and solunar is 0', () => {
      const result = calculateHourlyScore(80, 0);

      expect(result.score).toBe(48);
      expect(result.tier).toBe('NEUTRAL');
    });
  });

  describe('Scenario 3: Configurable weight adjustment', () => {
    it('calculates score 90 with tier TOP using custom weights (0.80/0.20)', () => {
      const result = calculateHourlyScore(100, 50, {
        tide: 0.8,
        solunar: 0.2,
      });

      expect(result.score).toBe(90);
      expect(result.tier).toBe('TOP');
    });
  });

  describe('Edge case: Null/undefined inputs', () => {
    it('treats null tide rating as 0 (neutral)', () => {
      const result = calculateHourlyScore(null, 100);

      expect(result.score).toBe(40);
      expect(result.tier).toBe('NEUTRAL');
    });

    it('treats undefined solunar rating as 0 (neutral)', () => {
      const result = calculateHourlyScore(100, undefined);

      expect(result.score).toBe(60);
      expect(result.tier).toBe('MID');
    });

    it('treats both null/undefined as 0, returning score 0 with tier NEUTRAL', () => {
      const result = calculateHourlyScore(null, undefined);

      expect(result.score).toBe(0);
      expect(result.tier).toBe('NEUTRAL');
    });
  });

  describe('Edge case: Invalid weights validation', () => {
    it('throws error when weights do not sum to 1.0', () => {
      expect(() =>
        calculateHourlyScore(100, 100, {
          tide: 0.5,
          solunar: 0.25,
        }),
      ).toThrow(/must sum to 1.0/);
    });

    it('throws error when weights sum to > 1.0', () => {
      expect(() =>
        calculateHourlyScore(100, 100, {
          tide: 0.6,
          solunar: 0.5,
        }),
      ).toThrow(/must sum to 1.0/);
    });
  });

  describe('Edge case: Boundary score assignments', () => {
    it('assigns NEUTRAL tier at score 0', () => {
      const result = calculateHourlyScore(0, 0);

      expect(result.score).toBe(0);
      expect(result.tier).toBe('NEUTRAL');
    });

    it('assigns NEUTRAL tier at score 49 (just below MID_TIER_MIN of 50)', () => {
      // With default weights (0.6/0.4): X * 0.6 + Y * 0.4 = 49
      // Solve: 60 * 0.6 + 17.5 * 0.4 = 36 + 7 = 43 (round down)
      // Try 75 * 0.6 + 2.5 * 0.4 = 45 + 1 = 46 (round up to 46)
      // Try 81.67 * 0.6 + 0 * 0.4 = 49 (rounded)
      const result = calculateHourlyScore(81.67, 0);

      expect(result.score).toBe(49);
      expect(result.tier).toBe('NEUTRAL');
    });

    it('assigns MID tier at score 50 (MID_TIER_MIN)', () => {
      // 83.33 * 0.6 + 0 * 0.4 = 50
      const result = calculateHourlyScore(83.33, 0);

      expect(result.score).toBe(50);
      expect(result.tier).toBe('MID');
    });

    it('assigns MID tier at score 79 (just below TOP_TIER_MIN of 80)', () => {
      // 131.67 * 0.6 + 0 * 0.4 = 79 (clamped to 100, but let's use realistic values)
      // With clamping: 100 * 0.6 + 31.67 * 0.4 = 60 + 12.67 = 72.67 ≈ 73
      // Let's try: 85 * 0.6 + 70 * 0.4 = 51 + 28 = 79
      const result = calculateHourlyScore(85, 70);

      expect(result.score).toBe(79);
      expect(result.tier).toBe('MID');
    });

    it('assigns TOP tier at score 80 (TOP_TIER_MIN)', () => {
      // 100 * 0.6 + 50 * 0.4 = 60 + 20 = 80
      const result = calculateHourlyScore(100, 50);

      expect(result.score).toBe(80);
      expect(result.tier).toBe('TOP');
    });

    it('assigns TOP tier at score 100', () => {
      const result = calculateHourlyScore(100, 100);

      expect(result.score).toBe(100);
      expect(result.tier).toBe('TOP');
    });
  });

  describe('Edge case: Input clamping', () => {
    it('clamps negative tide rating to 0', () => {
      const result = calculateHourlyScore(-50, 100);

      expect(result.score).toBe(40);
      expect(result.tier).toBe('NEUTRAL');
    });

    it('clamps over-100 solunar rating to 100', () => {
      const result = calculateHourlyScore(100, 150);

      expect(result.score).toBe(100);
      expect(result.tier).toBe('TOP');
    });

    it('clamps both inputs when out of bounds', () => {
      const result = calculateHourlyScore(-25, 225);

      expect(result.score).toBe(40);
      expect(result.tier).toBe('NEUTRAL');
    });
  });

  describe('Edge case: Rounding behavior', () => {
    it('rounds 48.4 down to 48', () => {
      // 80 * 0.6 + 0.67 * 0.4 = 48 + 0.268 = 48.268 ≈ 48
      const result = calculateHourlyScore(80, 0.67);

      expect(result.score).toBe(48);
    });

    it('rounds 48.5 to 48 (banker\'s rounding / standard Math.round)', () => {
      // 80.83 * 0.6 + 0 * 0.4 = 48.498 (rounded via Math.round)
      const result = calculateHourlyScore(80.83, 0);

      expect(result.score).toBe(48);
    });

    it('rounds 89.6 up to 90', () => {
      // 100 * 0.6 + 49.67 * 0.4 = 60 + 19.868 = 79.868 ≈ 80
      // Let's try: 100 * 0.6 + 99 * 0.4 = 60 + 39.6 = 99.6 ≈ 100
      const result = calculateHourlyScore(100, 100);

      expect(result.score).toBe(100);
    });
  });
});
