import { describe, expect, it } from "vitest";
import {
  calculateNeutralSolunarRating,
  calculateSolunarPeakRating,
} from "./solunarRating.js";

const anchored = {
  sunrise: "06:00",
  sunset: "18:00",
  illumination: 2,
  moonDistance: 381600,
};

const rules = {
  solunar_v2: {
    baseScores: { major: 80, minor: 50, none: 0 },
    phase: {
      syzygyIlluminationThreshold: 5,
      syzygyMultiplier: 1.15,
      neapIlluminationMin: 45,
      neapIlluminationMax: 55,
      neapMultiplier: 0.85,
      defaultMultiplier: 1.0,
    },
    solar: {
      dawnDuskWindowMinutes: 45,
      dawnDuskMultiplier: 1.25,
      solarNoonWindowMinutes: 45,
      solarNoonMultiplier: 1.1,
      defaultMultiplier: 1.0,
    },
    distance: {
      perigeeKmMin: 356500,
      perigeeKmMax: 363350,
      perigeeMultiplier: 1.05,
      apogeeKmMin: 399850,
      apogeeKmMax: 406700,
      apogeeMultiplier: 0.95,
      defaultMultiplier: 1.0,
    },
  },
};

describe("solunar rating", () => {
  it("matches a major period overlapping dawn", () => {
    // Major base: 80 × New Moon phase (1.15) × dawn boost (1.25) × avg distance (1.0) = 115 → clamped to 100
    const rating = calculateSolunarPeakRating(
      { type: "Major 1", time: "06:15" },
      anchored,
      rules,
    );

    expect(rating).toBe(100);
  });

  it("keeps a first-quarter midday major period weak", () => {
    // Major base: 80 × First Quarter phase (0.85) × midday solar (1.0) × avg distance (1.0) = 68
    const rating = calculateSolunarPeakRating(
      { type: "Major 1", time: "13:30" },
      { ...anchored, illumination: 50 },
      rules,
    );

    expect(rating).toBe(68);
  });

  it("uses the fixed theoretical maximum and neutral baseline", () => {
    // Major base: 80 × New Moon phase (1.15) × dawn exact (1.25) × perigee (1.05) = 121 → clamped to 100
    const rating = calculateSolunarPeakRating(
      { type: "Major 1", time: "06:00" },
      { ...anchored, moonDistance: 356500 },
      rules,
    );

    expect(rating).toBe(100);
    expect(calculateNeutralSolunarRating(rules)).toBe(0);
  });

  it("interpolates lunar distance between perigee and apogee", () => {
    // Minor perigee: 50 × New Moon (1.15) × solar noon (1.1) × perigee (1.05) = 66
    const perigee = calculateSolunarPeakRating(
      { type: "Minor 1", time: "12:00" },
      { ...anchored, moonDistance: 356500 },
      rules,
    );
    // Minor apogee: 50 × New Moon (1.15) × solar noon (1.1) × apogee (0.95) = 60
    const apogee = calculateSolunarPeakRating(
      { type: "Minor 1", time: "12:00" },
      { ...anchored, moonDistance: 406700 },
      rules,
    );

    expect(perigee).toBeGreaterThan(apogee);
    expect(perigee).toBe(66);
    expect(apogee).toBe(60);
  });
});
