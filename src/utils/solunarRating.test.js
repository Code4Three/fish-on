import { describe, expect, it } from "vitest";
import {
  calculateNeutralSolunarRating,
  calculateSolunarPeakRating,
} from "./solunarRating.js";

const anchored = {
  sunrise: "06:00",
  sunset: "18:00",
  moonPhase: "New Moon",
  moonDistance: 381600,
};

const rules = {
  solunar: {
    baseWeights: { major: 60, minor: 30, neutral: 5 },
    maxScore: 99,
    phaseMultipliers: {
      "New Moon": 1,
      "First Quarter": 0.6,
    },
    solar: {
      dawnDuskMinutes: 45,
      exactDawnDuskBoost: 1.5,
      dawnDuskBoost: 1.45,
      solarNoonMinutes: 60,
      solarNoonBoost: 1.1,
    },
    distance: {
      perigeeKm: 356500,
      apogeeKm: 406700,
      perigeeMultiplier: 1.1,
      apogeeMultiplier: 0.9,
    },
  },
};

describe("solunar rating", () => {
  it("matches a major period overlapping dawn", () => {
    const rating = calculateSolunarPeakRating(
      { type: "Major 1", time: "06:15" },
      anchored,
      rules,
    );

    expect(rating).toBe(88);
  });

  it("keeps a first-quarter midday major period weak", () => {
    const rating = calculateSolunarPeakRating(
      { type: "Major 1", time: "13:30" },
      { ...anchored, moonPhase: "First Quarter" },
      rules,
    );

    expect(rating).toBe(36);
  });

  it("uses the fixed theoretical maximum and neutral baseline", () => {
    const rating = calculateSolunarPeakRating(
      { type: "Major 1", time: "06:00" },
      { ...anchored, moonDistance: 356500 },
      rules,
    );

    expect(rating).toBe(100);
    expect(calculateNeutralSolunarRating(rules)).toBe(5);
  });

  it("interpolates lunar distance between perigee and apogee", () => {
    const perigee = calculateSolunarPeakRating(
      { type: "Minor 1", time: "12:00" },
      { ...anchored, moonDistance: 356500 },
      rules,
    );
    const apogee = calculateSolunarPeakRating(
      { type: "Minor 1", time: "12:00" },
      { ...anchored, moonDistance: 406700 },
      rules,
    );

    expect(perigee).toBeGreaterThan(apogee);
    expect(perigee).toBe(37);
    expect(apogee).toBe(30);
  });
});
