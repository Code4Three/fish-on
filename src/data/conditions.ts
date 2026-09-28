// Adapts runtime condition slices into the shape the dashboard cards expect.
import scoringRules from "../config/scoringRules.json";
import { TIME_ZONE } from "../config/constants.js";
import { getZonedInstant } from "./runtimeAstronomy.js";
import {
  ENVIRONMENTAL_METRICS,
  type EnvironmentalMetricDefinition,
} from "../config/metricMatrix";
import {
  calculateConditionScore,
  calculateTideRating,
} from "../utils/scoringEngine.js";
import {
  calculateSolunarHourRating,
  calculateSolunarPeakRating,
} from "../utils/solunarRating.js";

export interface ConditionsTideEntry {
  time: string;
  height: number;
}

export interface ConditionsSolunarPeak {
  type: string;
  time: string | null;
  start: { date: string; time: string } | null;
  end: { date: string; time: string } | null;
}

export interface ConditionsAnchored {
  highTides: ConditionsTideEntry[];
  lowTides: ConditionsTideEntry[];
  sunrise: string | null;
  sunset: string | null;
  firstLight: string | null;
  lastLight: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: string | null;
  illumination: number | null;
  moonDistance: number | null;
  solunarPeaks: ConditionsSolunarPeak[];
  weatherSummary: string;
  tempRange: Array<number | null>;
  windRange: Array<number | null>;
  windBaseline: string;
  cloudBaseline: number;
  cloudCoverLowBaseline?: number | null;
  cloudCoverMidBaseline?: number | null;
  cloudCoverHighBaseline?: number | null;
  cloudBaseRange?: Array<number | null>;
  visibilityRange?: Array<number | null>;
  humidityRange?: Array<number | null>;
  humidityBaseline?: number | null;
  dewPointRange?: Array<number | null>;
  dewPointBaseline?: number | null;
  pressureRange: Array<number | null>;
  pressureBaseline?: number | null;
  rainChance: number | null;
  rainVolume: number | null;
  seaSurfaceTemperatureRange?: Array<number | null>;
  seaSurfaceTemperatureBaseline?: number | null;
  waveHeightRange?: Array<number | null>;
  waveHeightMax?: number | null;
  waveDirection?: string | null;
  waveDirectionDominant?: string | null;
  wavePeriodRange?: Array<number | null>;
  wavePeriodMax?: number | null;
  windWaveHeightRange?: Array<number | null>;
  windWaveHeightMax?: number | null;
  windWaveDirection?: string | null;
  windWaveDirectionDominant?: string | null;
  windWavePeriodRange?: Array<number | null>;
  windWavePeriodMax?: number | null;
  swellWaveHeightRange?: Array<number | null>;
  swellWaveHeightMax?: number | null;
  swellWaveDirection?: string | null;
  swellWaveDirectionDominant?: string | null;
  swellWavePeriodRange?: Array<number | null>;
  swellWavePeriodMax?: number | null;
  dayScore: number | null;
}

export interface ConditionsHour {
  time: string;
  height: number;
  tideStage: string;
  solunarCondition: string;
  pressureTrend: string;
  pressure: number;
  weatherCondition: string;
  wind: string;
  windSpeed: number;
  windGust?: number | null;
  windDirection: string;
  temperature: number;
  feelsLike?: number | null;
  humidity?: number | null;
  dewPoint?: number | null;
  cloudCover: number;
  cloudCoverLow?: number | null;
  cloudCoverMid?: number | null;
  cloudCoverHigh?: number | null;
  cloudBase?: number | null;
  visibility?: number | null;
  rainChance: number | null;
  rainVolume: number | null;
  uvIndex?: number | null;
  seaSurfaceTemperature?: number | null;
  waveHeight?: number | null;
  waveDirection?: string | null;
  wavePeriod?: number | null;
  windWaveHeight?: number | null;
  windWaveDirection?: string | null;
  windWavePeriod?: number | null;
  swellWaveHeight?: number | null;
  swellWaveDirection?: string | null;
  swellWavePeriod?: number | null;
}

export interface ConditionsDay {
  date: string;
  anchored: ConditionsAnchored;
  hours: ConditionsHour[];
}

export interface ClaudeHourlyData {
  time: string;
  hour: number;
  weatherSource?: "current" | "hourly";
  tideHeight: number;
  tideStage: string;
  wind: { speed: number; gust: number | null; dir: string };
  windLabel: string;
  solunar: "none" | "major" | "minor";
  solunarCondition: string;
  solunarRating: number;
  pressureTrend: string;
  score: number;
  scoreBand: "Peak" | "Strong" | "Favorable" | "Slow";
  tideDirection: "Flood" | "Ebb" | "Slack";
  pressure: number;
  airTemp: number;
  feelsLike: number | null;
  humidity?: number | null;
  dewPoint?: number | null;
  weatherCondition: string;
  cloudCover: number;
  cloudCoverLow?: number | null;
  cloudCoverMid?: number | null;
  cloudCoverHigh?: number | null;
  cloudBase?: number | null;
  visibility?: number | null;
  rainChance: number | null;
  rainVolume: number | null;
  uvIndex: number | null;
  seaSurfaceTemperature?: number | null;
  waveHeight?: number | null;
  waveDirection?: string | null;
  wavePeriod?: number | null;
  windWaveHeight?: number | null;
  windWaveDirection?: string | null;
  windWavePeriod?: number | null;
  swellWaveHeight?: number | null;
  swellWaveDirection?: string | null;
  swellWavePeriod?: number | null;
  environmentalValues: Record<string, string>;
  swell: { height: number; period: number; dir: string } | null;
}

export interface ClaudeDayData {
  date: string;
  hours: ClaudeHourlyData[];
  environmentalSummaries: Record<
    string,
    Pick<
      EnvironmentalMetricDisplayValues,
      "dailyBaseline" | "dailyRange" | "dailyMaximum" | "dailyDirection"
    >
  >;
  tideEvents: Array<{ hour: number; type: "High" | "Low"; height: number }>;
  majorWindows: Array<{ start: number; end: number; rating: number }>;
  minorWindows: Array<{ start: number; end: number; rating: number }>;
  solunarRating: number;
  dayScore: number;
  sun: {
    sunrise: number;
    sunset: number;
    firstLight: number | null;
    lastLight: number | null;
  };
  ranges: {
    waterTemp: { min: number; max: number } | null;
    airTemp: { min: number; max: number } | null;
    pressure: { min: number; max: number } | null;
    wind: { min: number; max: number; maxGust: number | null } | null;
    swell: { min: number; max: number; period: number; dir: string } | null;
    cloudBaseline: number | null;
    uvPeak: number | null;
  };
  secondary: {
    pressure: {
      value: number | null;
      trend: "Rising" | "Falling" | "Steady" | null;
    };
    waterTemp: string | null;
    swell: { height: string; period: number; dir: string } | null;
    moon: {
      phaseName: string | null;
      illum: number | null;
      moonrise: number | null;
      moonset: number | null;
    };
    rain: { chance: number | null; mm: number | null };
    uv: number | null;
    airTemp: { temp: number | null; feels: number | null };
  };
}

// Legacy shapes kept only for the still-unwired anchored hero/metric-grid components.
export interface TideMetric {
  height: number;
  unit: "m";
  stage: string;
  direction: "incoming" | "outgoing" | "slack";
}

export interface SolunarMetric {
  score: number;
  condition: string;
  peak: string | null;
}

export interface SecondaryMetrics {
  wind: { speed: number; direction: string; gusts: number; unit: "km/h" };
  pressure: { value: number; trend: string; unit: "hPa" };
  waterTemp: { value: number; unit: "°C" };
  swell: {
    height: number;
    direction: string;
    period: number;
    heightUnit: "m";
    periodUnit: "s";
  };
  moonPhase: { phase: string; illumination: number };
  rain: { chance: number; volume: number; volumeUnit: "mm" };
  uv: { index: number; level: string };
  airTemp: { value: number; feelsLike: number; unit: "°C" };
}

export interface AnchoredMetrics {
  timestamp: string;
  primaryTide: TideMetric;
  primarySolunar: SolunarMetric;
  secondaryMetrics: SecondaryMetrics;
}

function parseTimeToHour(time: string | null): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}

function toTimestamp(date: string, time: string, timezone: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return getZonedInstant(date, hours, minutes, timezone).getTime();
}

function toSolunarTag(
  condition: string | undefined,
): ClaudeHourlyData["solunar"] {
  if (!condition) return "none";
  if (condition.includes("Major")) return "major";
  if (condition.includes("Minor")) return "minor";
  return "none";
}

function toTideDirection(
  tideStage: string | undefined,
): ClaudeHourlyData["tideDirection"] {
  if (!tideStage) return "Slack";
  if (tideStage.includes("Run In")) return "Flood";
  if (tideStage.includes("Run Out")) return "Ebb";
  return "Slack";
}

function toScoreBand(
  bandName: string | undefined,
): ClaudeHourlyData["scoreBand"] {
  if (bandName === "Peak") return "Peak";
  if (bandName === "Strong") return "Strong";
  if (bandName === "Favorable") return "Favorable";
  return "Slow";
}

function buildTideEventTimeline(
  days: ConditionsDay[],
  timezone: string,
): Array<{ type: "High" | "Low"; at: number }> {
  return days
    .flatMap((day) => [
      ...(day.anchored.lowTides ?? []).map((tide) => ({
        type: "Low" as const,
        at: toTimestamp(day.date, tide.time, timezone),
      })),
      ...(day.anchored.highTides ?? []).map((tide) => ({
        type: "High" as const,
        at: toTimestamp(day.date, tide.time, timezone),
      })),
    ])
    .sort((a, b) => a.at - b.at);
}

function windowHour(
  part: { date: string; time: string },
  dayDate: string,
): number {
  const hour = parseTimeToHour(part.time);
  if (part.date === dayDate) return hour;
  return part.date < dayDate ? hour - 24 : hour + 24;
}

function computePressureTrend(
  hours: ClaudeHourlyData[],
): "Rising" | "Falling" | "Steady" | null {
  if (!hours.length) return null;
  const first = hours[0].pressure;
  const last = hours[hours.length - 1].pressure;
  if (first == null || last == null) return null;
  const delta = last - first;
  if (delta > 1) return "Rising";
  if (delta < -1) return "Falling";
  return "Steady";
}

export interface EnvironmentalMetricDisplayValues {
  metric: EnvironmentalMetricDefinition;
  hourlyValue: string;
  dailyBaseline: string;
  dailyRange: string;
  dailyMaximum: string;
  dailyDirection: string;
}

export function formatConditionMetricValue(
  value: unknown,
  unit: string,
  precision = 0,
): string {
  if (value == null) return "--";

  let formattedValue: string;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "--";
    formattedValue = String(Number(value.toFixed(precision)));
  } else if (typeof value === "string") {
    formattedValue = value.trim();
    if (!formattedValue) return "--";
  } else {
    return "--";
  }

  if (!unit) return formattedValue;
  if (unit === "%" || unit.startsWith("°")) return `${formattedValue}${unit}`;
  return `${formattedValue} ${unit}`;
}

function getMetricProperty(source: unknown, key?: string): unknown {
  if (!key || !source || typeof source !== "object") return null;
  return (source as Record<string, unknown>)[key] ?? null;
}

function formatMetricRange(
  value: unknown,
  unit: string,
  precision = 0,
): string {
  if (!Array.isArray(value) || value.length < 2) return "--";
  const minimum = formatConditionMetricValue(value[0], unit, precision);
  const maximum = formatConditionMetricValue(value[1], unit, precision);
  if (minimum === "--" && maximum === "--") return "--";
  return `${minimum} - ${maximum}`;
}

export function getEnvironmentalMetricDisplayValues(
  day: ConditionsDay | null | undefined,
  hourIndex: number,
  metricId: string,
): EnvironmentalMetricDisplayValues | null {
  const metric = ENVIRONMENTAL_METRICS.find((item) => item.id === metricId);
  if (!metric) return null;

  const anchored = day?.anchored;
  const hour = day?.hours?.[hourIndex];
  const dailyKeys = metric.dailyKeys;
  const precision = metric.precision ?? 0;

  return {
    metric,
    hourlyValue: formatConditionMetricValue(
      getMetricProperty(hour, metric.key),
      metric.unit,
      precision,
    ),
    dailyBaseline: formatConditionMetricValue(
      getMetricProperty(anchored, dailyKeys?.baseline),
      metric.unit,
      precision,
    ),
    dailyRange: formatMetricRange(
      getMetricProperty(anchored, dailyKeys?.range),
      metric.unit,
      precision,
    ),
    dailyMaximum: formatConditionMetricValue(
      getMetricProperty(anchored, dailyKeys?.maximum),
      metric.unit,
      precision,
    ),
    dailyDirection: formatConditionMetricValue(
      getMetricProperty(anchored, dailyKeys?.direction),
      "",
      precision,
    ),
  };
}

// Pure transform: given the full days list (for tide continuity) and the day index, build the dashboard-ready day.
export function buildDayData(
  days: ConditionsDay[],
  index: number,
  timezone = TIME_ZONE,
): ClaudeDayData {
  const day = days[index];
  const tideTimeline = buildTideEventTimeline(days, timezone);

  const hours: ClaudeHourlyData[] = day.hours.map((item, hourIndex) => {
    const at = toTimestamp(day.date, item.time, timezone);
    const tideRating = calculateTideRating(at, tideTimeline, scoringRules);
    const solunarRating = calculateSolunarHourRating(
      day,
      item.time,
      scoringRules,
    );
    const { score, band } = calculateConditionScore(
      tideRating,
      solunarRating,
      scoringRules,
    );

    return {
      time: item.time,
      hour: parseTimeToHour(item.time),
      weatherSource: "hourly",
      tideHeight: item.height,
      tideStage: item.tideStage,
      wind: {
        speed: item.windSpeed,
        gust: item.windGust ?? null,
        dir: item.windDirection,
      },
      windLabel: item.wind,
      solunar: toSolunarTag(item.solunarCondition),
      solunarCondition: item.solunarCondition,
      solunarRating,
      pressureTrend: item.pressureTrend,
      score: Math.round(score),
      scoreBand: toScoreBand(band?.name),
      tideDirection: toTideDirection(item.tideStage),
      pressure: item.pressure,
      airTemp: item.temperature,
      feelsLike: item.feelsLike ?? null,
      weatherCondition: item.weatherCondition,
      cloudCover: item.cloudCover,
      cloudCoverLow: item.cloudCoverLow ?? null,
      cloudCoverMid: item.cloudCoverMid ?? null,
      cloudCoverHigh: item.cloudCoverHigh ?? null,
      cloudBase: item.cloudBase ?? null,
      visibility: item.visibility ?? null,
      humidity: item.humidity ?? null,
      dewPoint: item.dewPoint ?? null,
      rainChance: item.rainChance,
      rainVolume: item.rainVolume,
      uvIndex: item.uvIndex ?? null,
      seaSurfaceTemperature: item.seaSurfaceTemperature ?? null,
      waveHeight: item.waveHeight ?? null,
      waveDirection: item.waveDirection ?? null,
      wavePeriod: item.wavePeriod ?? null,
      windWaveHeight: item.windWaveHeight ?? null,
      windWaveDirection: item.windWaveDirection ?? null,
      windWavePeriod: item.windWavePeriod ?? null,
      swellWaveHeight: item.swellWaveHeight ?? null,
      swellWaveDirection: item.swellWaveDirection ?? null,
      swellWavePeriod: item.swellWavePeriod ?? null,
      environmentalValues: Object.fromEntries(
        ENVIRONMENTAL_METRICS.map((metric) => [
          metric.id,
          getEnvironmentalMetricDisplayValues(day, hourIndex, metric.id)
            ?.hourlyValue ?? "--",
        ]),
      ),
      swell: null,
    };
  });

  const tideEvents = [
    ...(day.anchored.highTides ?? []).map((tide) => ({
      hour: parseTimeToHour(tide.time),
      type: "High" as const,
      height: tide.height,
    })),
    ...(day.anchored.lowTides ?? []).map((tide) => ({
      hour: parseTimeToHour(tide.time),
      type: "Low" as const,
      height: tide.height,
    })),
  ].sort((a, b) => a.hour - b.hour);

  const peaks = day.anchored.solunarPeaks ?? [];
  const majorWindows = peaks
    .filter(
      (peak) => peak.type.includes("Major") && peak.start && peak.end,
    )
    .map((peak) => ({
      start: windowHour(peak.start, day.date),
      end: windowHour(peak.end, day.date),
      rating: calculateSolunarPeakRating(peak, day.anchored, scoringRules),
    }))
    .sort((firstWindow, secondWindow) => firstWindow.start - secondWindow.start);
  const minorWindows = peaks
    .filter(
      (peak) => peak.type.includes("Minor") && peak.start && peak.end,
    )
    .map((peak) => ({
      start: windowHour(peak.start, day.date),
      end: windowHour(peak.end, day.date),
      rating: calculateSolunarPeakRating(peak, day.anchored, scoringRules),
    }))
    .sort((firstWindow, secondWindow) => firstWindow.start - secondWindow.start);

  const solunarRating = Math.max(
    0,
    ...peaks.map((peak) =>
      calculateSolunarPeakRating(peak, day.anchored, scoringRules),
    ),
  );
  const rainChanceValues = hours
    .map((item) => item.rainChance)
    .filter((value): value is number => value != null);
  const rainVolumeValues = hours
    .map((item) => item.rainVolume)
    .filter((value): value is number => value != null);
  const gustValues = hours
    .map((item) => item.wind.gust)
    .filter((value): value is number => value != null);
  const uvValues = hours
    .map((item) => item.uvIndex)
    .filter((value): value is number => value != null);
  const environmentalSummaries = Object.fromEntries(
    ENVIRONMENTAL_METRICS.map((metric) => {
      const values = getEnvironmentalMetricDisplayValues(day, 0, metric.id);
      return [metric.id, {
        dailyBaseline: values?.dailyBaseline ?? "--",
        dailyRange: values?.dailyRange ?? "--",
        dailyMaximum: values?.dailyMaximum ?? "--",
        dailyDirection: values?.dailyDirection ?? "--",
      }];
    }),
  );

  return {
    date: day.date,
    hours,
    environmentalSummaries,
    tideEvents,
    majorWindows,
    minorWindows,
    solunarRating,
    dayScore: hours.length ? Math.max(...hours.map((item) => item.score)) : 0,
    sun: {
      sunrise: parseTimeToHour(day.anchored.sunrise),
      sunset: parseTimeToHour(day.anchored.sunset),
      firstLight: parseTimeToHour(day.anchored.firstLight),
      lastLight: parseTimeToHour(day.anchored.lastLight),
    },
    ranges: {
      waterTemp: null,
      airTemp: day.anchored.tempRange
        ? { min: day.anchored.tempRange[0], max: day.anchored.tempRange[1] }
        : null,
      pressure: day.anchored.pressureRange
        ? {
          min: day.anchored.pressureRange[0],
          max: day.anchored.pressureRange[1],
        }
        : null,
      wind: day.anchored.windRange
        ? {
          min: day.anchored.windRange[0],
          max: day.anchored.windRange[1],
          maxGust: gustValues.length ? Math.max(...gustValues) : null,
        }
        : null,
      swell: null,
      cloudBaseline: day.anchored.cloudBaseline ?? null,
      uvPeak: uvValues.length ? Math.max(...uvValues) : null,
    },
    secondary: {
      pressure: {
        value: hours[0]?.pressure ?? null,
        trend: computePressureTrend(hours),
      },
      waterTemp: null,
      swell: null,
      moon: {
        phaseName: day.anchored.moonPhase ?? null,
        illum: day.anchored.illumination ?? null,
        moonrise: day.anchored.moonrise
          ? parseTimeToHour(day.anchored.moonrise)
          : null,
        moonset: day.anchored.moonset
          ? parseTimeToHour(day.anchored.moonset)
          : null,
      },
      rain: {
        chance:
          day.anchored.rainChance ??
          (rainChanceValues.length ? Math.max(...rainChanceValues) : null),
        mm:
          day.anchored.rainVolume ??
          (rainVolumeValues.length
            ? Math.round(rainVolumeValues.reduce((total, value) => total + value, 0) * 10) /
            10
            : null),
      },
      uv: uvValues.length ? Math.max(...uvValues) : null,
      airTemp: {
        temp: hours[0]?.airTemp ?? null,
        feels: hours[0]?.feelsLike ?? null,
      },
    },
  };
}
