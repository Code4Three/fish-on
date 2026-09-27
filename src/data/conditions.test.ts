import { describe, expect, it } from "vitest";
import conditionsFixture from "../../public/conditions.json";
import {
  buildDayData,
  formatConditionMetricValue,
  getEnvironmentalMetricDisplayValues,
} from "./conditions";

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
      weatherCondition: conditionsFixture.days[0].hours[0].weatherCondition,
    });
    day.hours.forEach((hour) => {
      expect(hour.score).toBeGreaterThanOrEqual(0);
      expect(hour.score).toBeLessThanOrEqual(100);
      expect(hour.solunarRating).toBeGreaterThanOrEqual(0);
      expect(hour.solunarRating).toBeLessThanOrEqual(100);
      expect(["Peak", "Strong", "Favorable", "Slow"]).toContain(hour.scoreBand);
    });
  });

  it("falls back to null for metrics missing from conditions.json", () => {
    const sourceDay = conditionsFixture.days[0];
    const dayWithMissingHumidity = buildDayData(
      [
        {
          ...sourceDay,
          hours: sourceDay.hours.map((hour, hourIndex) =>
            hourIndex === 0 ? { ...hour, humidity: null } : hour,
          ),
        },
      ],
      0,
    );

    expect(day.hours[0].swell).toBeNull();
    expect(day.secondary.waterTemp).toBeNull();
    expect(day.ranges.swell).toBeNull();
    expect(dayWithMissingHumidity.hours[0].humidity).toBeNull();
    expect(dayWithMissingHumidity.hours[0].environmentalValues.humidity).toBe(
      "--",
    );
  });

  it("derives major/minor solunar windows from anchored solunar peaks", () => {
    expect(day.majorWindows.length).toBeGreaterThan(0);
    expect(day.minorWindows.length).toBeGreaterThan(0);
    expect(day.majorWindows).toEqual(
      [...day.majorWindows].sort((firstWindow, secondWindow) => firstWindow.start - secondWindow.start),
    );
    expect(day.minorWindows).toEqual(
      [...day.minorWindows].sort((firstWindow, secondWindow) => firstWindow.start - secondWindow.start),
    );
    [...day.majorWindows, ...day.minorWindows].forEach((window) => {
      expect(window.rating).toBeGreaterThanOrEqual(0);
      expect(window.rating).toBeLessThanOrEqual(100);
    });
  });

  it("computes a day score as the max hourly score", () => {
    expect(day.dayScore).toBe(Math.max(...day.hours.map((hour) => hour.score)));
  });

  it("extracts matrix-configured hourly and daily environmental values", () => {
    const sourceDay = conditionsFixture.days[0];
    const humidity = getEnvironmentalMetricDisplayValues(
      sourceDay,
      0,
      "humidity",
    );

    expect(humidity?.hourlyValue).toBe(
      formatConditionMetricValue(sourceDay.hours[0].humidity, "%"),
    );
    expect(humidity?.dailyBaseline).toBe(
      formatConditionMetricValue(sourceDay.anchored.humidityBaseline, "%"),
    );
    expect(humidity?.dailyRange).toContain(" - ");
    expect(day.hours[0].environmentalValues.humidity).toBe(
      humidity?.hourlyValue,
    );
    expect(day.environmentalSummaries.humidity.dailyBaseline).toBe(
      humidity?.dailyBaseline,
    );
  });

  it("formats missing and incomplete metric values as placeholders", () => {
    const sourceDay = conditionsFixture.days[0];
    const incompleteDay = {
      ...sourceDay,
      anchored: {
        ...sourceDay.anchored,
        humidityBaseline: null,
        humidityRange: [null, null],
      },
      hours: [{ ...sourceDay.hours[0], humidity: null }],
    };
    const humidity = getEnvironmentalMetricDisplayValues(
      incompleteDay,
      0,
      "humidity",
    );

    expect(formatConditionMetricValue(null, "%")).toBe("--");
    expect(formatConditionMetricValue(undefined, "°C")).toBe("--");
    expect(humidity?.hourlyValue).toBe("--");
    expect(humidity?.dailyBaseline).toBe("--");
    expect(humidity?.dailyRange).toBe("--");
  });
});
