import { describe, expect, it } from "vitest";
import { generateClaudeDayData } from "./mockMarineData";

describe("generateClaudeDayData", () => {
  const day = generateClaudeDayData(0);

  it("produces 24 hourly entries with score, band and hourly weather fields", () => {
    expect(day.hours).toHaveLength(24);
    day.hours.forEach(hour => {
      expect(hour.score).toBeGreaterThanOrEqual(0);
      expect(hour.score).toBeLessThanOrEqual(100);
      expect(["Peak", "Strong", "Favorable", "Slow"]).toContain(hour.scoreBand);
      expect(["Flood", "Ebb", "Slack"]).toContain(hour.tideDirection);
      expect(typeof hour.pressure).toBe("number");
      expect(typeof hour.airTemp).toBe("number");
      expect(typeof hour.cloudCover).toBe("number");
      expect(typeof hour.rainChance).toBe("number");
      expect(typeof hour.swell.height).toBe("number");
    });
  });

  it("marks uvIndex as null overnight (outside daylight hours)", () => {
    const nightHour = day.hours.find(hour => hour.hour === 0);
    expect(nightHour?.uvIndex).toBeNull();
  });

  it("computes day-level ranges and slack windows", () => {
    expect(day.dayScore).toBeGreaterThanOrEqual(0);
    expect(day.ranges.waterTemp.max).toBeGreaterThanOrEqual(day.ranges.waterTemp.min);
    expect(day.ranges.pressure.max).toBeGreaterThanOrEqual(day.ranges.pressure.min);
    expect(Array.isArray(day.slackWindows)).toBe(true);
    expect(day.sun.sunrise).toBeLessThan(day.sun.sunset);
  });
});
