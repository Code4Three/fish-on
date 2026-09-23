import { describe, expect, it } from "vitest";
import conditionsFixture from "../../public/conditions.json";
import { buildDayData } from "./conditions";

describe("buildDayData", () => {
  const day = buildDayData(conditionsFixture.days, 0);

  it("maps every hour and derives a score band from real tide/solunar data", () => {
    expect(day.hours).toHaveLength(24);
    expect(day.hours[0]).toMatchObject({
      time: conditionsFixture.days[0].hours[0].time,
      tideStage: conditionsFixture.days[0].hours[0].tideStage,
      windLabel: conditionsFixture.days[0].hours[0].wind,
      solunarCondition: conditionsFixture.days[0].hours[0].solunarCondition,
      pressureTrend: conditionsFixture.days[0].hours[0].pressureTrend,
      weatherCondition: conditionsFixture.days[0].hours[0].weatherCondition
    });
    day.hours.forEach(hour => {
      expect(hour.score).toBeGreaterThanOrEqual(0);
      expect(hour.score).toBeLessThanOrEqual(100);
      expect(["Peak", "Strong", "Favorable", "Slow"]).toContain(hour.scoreBand);
    });
  });

  it("falls back to null for metrics missing from conditions.json", () => {
    expect(day.hours[0].swell).toBeNull();
    expect(day.hours[0].uvIndex).toBeNull();
    expect(day.secondary.waterTemp).toBeNull();
    expect(day.ranges.swell).toBeNull();
  });

  it("derives major/minor solunar windows from anchored solunar peaks", () => {
    expect(day.majorWindows.length).toBeGreaterThan(0);
    expect(day.minorWindows.length).toBeGreaterThan(0);
  });

  it("computes a day score as the max hourly score", () => {
    expect(day.dayScore).toBe(Math.max(...day.hours.map(hour => hour.score)));
  });
});
