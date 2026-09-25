import { describe, expect, it } from "vitest";
import rules from "../config/scoringRules.json";
import {
  calculateConditionScore,
  calculateTideRating,
  getScoreBand,
} from "./scoringEngine.js";

describe("calculateConditionScore", () => {
  it("returns Peak for overlapping peak conditions", () => {
    const result = calculateConditionScore(100, 100, rules);

    expect(result.score).toBe(100);
    expect(result.band.name).toBe("Peak");
  });

  it("returns Low for a neutral solunar period", () => {
    const result = calculateConditionScore(80, 0, rules);

    expect(result.score).toBe(48);
    expect(result.band.name).toBe("Low");
  });

  it("supports custom weights", () => {
    const result = calculateConditionScore(100, 50, {
      ...rules,
      weights: { tide: 0.8, solunar: 0.2 },
    });

    expect(result.score).toBe(90);
    expect(result.band.name).toBe("Peak");
  });

  it("uses neutral ratings for missing inputs", () => {
    const result = calculateConditionScore(null, undefined, rules);

    expect(result.score).toBe(0);
    expect(result.band.name).toBe("Neutral");
  });

  it("rejects weights that do not sum to one", () => {
    expect(() =>
      calculateConditionScore(100, 100, {
        ...rules,
        weights: { tide: 0.5, solunar: 0.25 },
      }),
    ).toThrow("must sum to 1.0");
  });

  it("assigns all six inclusive band boundaries", () => {
    expect(getScoreBand(0, rules.bands).name).toBe("Neutral");
    expect(getScoreBand(20, rules.bands).name).toBe("Very Low");
    expect(getScoreBand(40, rules.bands).name).toBe("Low");
    expect(getScoreBand(50, rules.bands).name).toBe("Favorable");
    expect(getScoreBand(65, rules.bands).name).toBe("Strong");
    expect(getScoreBand(80, rules.bands).name).toBe("Peak");
    expect(getScoreBand(49.5, rules.bands).name).toBe("Low");
  });

  it("scores the final two hours of a run-in as the peak window", () => {
    const events = [
      { type: "Low", at: Date.parse("2026-09-20T06:00:00") },
      { type: "High", at: Date.parse("2026-09-20T12:00:00") },
    ];

    expect(
      calculateTideRating(Date.parse("2026-09-20T10:00:00"), events, rules),
    ).toBe(100);
    expect(
      calculateTideRating(Date.parse("2026-09-20T09:00:00"), events, rules),
    ).toBe(75);
  });
});
