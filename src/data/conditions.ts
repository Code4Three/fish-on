// Adapts the generated /conditions.json payload into the shape the dashboard cards expect.
import scoringRules from "../config/scoringRules.json";
import { calculateConditionScore, calculateTideRating } from "../utils/scoringEngine.js";

export interface ConditionsTideEntry {
  time: string;
  height: number;
}

export interface ConditionsSolunarPeak {
  type: string;
  time: string;
  start: { date: string; time: string };
  end: { date: string; time: string };
}

export interface ConditionsAnchored {
  highTides: ConditionsTideEntry[];
  lowTides: ConditionsTideEntry[];
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  illumination: number;
  solunarPeaks: ConditionsSolunarPeak[];
  weatherSummary: string;
  tempRange: [number, number];
  windRange: [number, number];
  windBaseline: string;
  cloudBaseline: number;
  pressureRange: [number, number];
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
  windDirection: string;
  temperature: number;
  cloudCover: number;
  rainChance: number;
}

export interface ConditionsDay {
  date: string;
  anchored: ConditionsAnchored;
  hours: ConditionsHour[];
}

export interface ConditionsResponse {
  days: ConditionsDay[];
}

export interface ClaudeHourlyData {
  hour: number;
  tideHeight: number;
  wind: { speed: number; gust: number | null; dir: string };
  solunar: "none" | "major" | "minor";
  score: number;
  scoreBand: "Peak" | "Strong" | "Favorable" | "Slow";
  tideDirection: "Flood" | "Ebb" | "Slack";
  pressure: number;
  airTemp: number;
  cloudCover: number;
  rainChance: number;
  rainVolume: number | null;
  uvIndex: number | null;
  swell: { height: number; period: number; dir: string } | null;
}

export interface ClaudeDayData {
  date: string;
  hours: ClaudeHourlyData[];
  tideEvents: Array<{ hour: number; type: "High" | "Low"; height: number }>;
  majorWindows: Array<{ start: number; end: number }>;
  minorWindows: Array<{ start: number; end: number }>;
  solunarRating: number;
  dayScore: number;
  sun: { sunrise: number; sunset: number; firstLight: number | null; lastLight: number | null };
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
    pressure: { value: number | null; trend: "Rising" | "Falling" | "Steady" | null };
    waterTemp: string | null;
    swell: { height: string; period: number; dir: string } | null;
    moon: { phaseName: string | null; illum: number | null; moonrise: number | null; moonset: number | null };
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
  swell: { height: number; direction: string; period: number; heightUnit: "m"; periodUnit: "s" };
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

function parseTimeToHour(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}

function toTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}:00`).getTime();
}

function toSolunarTag(condition: string | undefined): ClaudeHourlyData["solunar"] {
  if (!condition) return "none";
  if (condition.includes("Major")) return "major";
  if (condition.includes("Minor")) return "minor";
  return "none";
}

function toTideDirection(tideStage: string | undefined): ClaudeHourlyData["tideDirection"] {
  if (!tideStage) return "Slack";
  if (tideStage.includes("Run In")) return "Flood";
  if (tideStage.includes("Run Out")) return "Ebb";
  return "Slack";
}

function toScoreBand(bandName: string | undefined): ClaudeHourlyData["scoreBand"] {
  if (bandName === "Peak") return "Peak";
  if (bandName === "Strong") return "Strong";
  if (bandName === "Favorable") return "Favorable";
  return "Slow";
}

// Major and minor peaks rate higher than a normal hour.
function getSolunarRating(condition: string | undefined): number {
  if (!condition) return 0;
  return [
    ["Major 1", 100],
    ["Major 2", 80],
    ["Minor 1", 60],
    ["Minor 2", 40]
  ].find(([name]) => condition.includes(name as string))?.[1] as number ?? 0;
}

function buildTideEventTimeline(days: ConditionsDay[]): Array<{ type: "High" | "Low"; at: number }> {
  return days
    .flatMap(day => [
      ...(day.anchored.lowTides ?? []).map(tide => ({ type: "Low" as const, at: toTimestamp(day.date, tide.time) })),
      ...(day.anchored.highTides ?? []).map(tide => ({ type: "High" as const, at: toTimestamp(day.date, tide.time) }))
    ])
    .sort((a, b) => a.at - b.at);
}

function windowHour(part: { date: string; time: string }, dayDate: string): number {
  const hour = parseTimeToHour(part.time);
  if (part.date === dayDate) return hour;
  return part.date < dayDate ? hour - 24 : hour + 24;
}

function computePressureTrend(hours: ClaudeHourlyData[]): "Rising" | "Falling" | "Steady" | null {
  if (!hours.length) return null;
  const first = hours[0].pressure;
  const last = hours[hours.length - 1].pressure;
  if (first == null || last == null) return null;
  const delta = last - first;
  if (delta > 1) return "Rising";
  if (delta < -1) return "Falling";
  return "Steady";
}

export async function fetchConditionsDays(): Promise<ConditionsDay[]> {
  const response = await fetch("/conditions.json");
  if (!response.ok) {
    throw new Error(`Failed to load conditions (status ${response.status})`);
  }
  const data: ConditionsResponse = await response.json();
  if (!data || !Array.isArray(data.days) || data.days.length === 0) {
    throw new Error("Conditions data is missing or malformed");
  }
  return data.days;
}

// Pure transform: given the full days list (for tide continuity) and the day index, build the dashboard-ready day.
export function buildDayData(days: ConditionsDay[], index: number): ClaudeDayData {
  const day = days[index];
  const tideTimeline = buildTideEventTimeline(days);

  const hours: ClaudeHourlyData[] = day.hours.map(item => {
    const at = toTimestamp(day.date, item.time);
    const tideRating = calculateTideRating(at, tideTimeline, scoringRules);
    const solunarRating = getSolunarRating(item.solunarCondition);
    const { score, band } = calculateConditionScore(tideRating, solunarRating, scoringRules);

    return {
      hour: parseTimeToHour(item.time),
      tideHeight: item.height,
      wind: { speed: item.windSpeed, gust: null, dir: item.windDirection },
      solunar: toSolunarTag(item.solunarCondition),
      score: Math.round(score),
      scoreBand: toScoreBand(band?.name),
      tideDirection: toTideDirection(item.tideStage),
      pressure: item.pressure,
      airTemp: item.temperature,
      cloudCover: item.cloudCover,
      rainChance: item.rainChance,
      rainVolume: null,
      uvIndex: null,
      swell: null
    };
  });

  const tideEvents = [
    ...(day.anchored.highTides ?? []).map(tide => ({ hour: parseTimeToHour(tide.time), type: "High" as const, height: tide.height })),
    ...(day.anchored.lowTides ?? []).map(tide => ({ hour: parseTimeToHour(tide.time), type: "Low" as const, height: tide.height }))
  ].sort((a, b) => a.hour - b.hour);

  const peaks = day.anchored.solunarPeaks ?? [];
  const majorWindows = peaks
    .filter(peak => peak.type.includes("Major"))
    .map(peak => ({ start: windowHour(peak.start, day.date), end: windowHour(peak.end, day.date) }));
  const minorWindows = peaks
    .filter(peak => peak.type.includes("Minor"))
    .map(peak => ({ start: windowHour(peak.start, day.date), end: windowHour(peak.end, day.date) }));

  const solunarRating = Math.max(0, ...peaks.map(peak => getSolunarRating(peak.type)));

  return {
    date: day.date,
    hours,
    tideEvents,
    majorWindows,
    minorWindows,
    solunarRating,
    dayScore: hours.length ? Math.max(...hours.map(item => item.score)) : 0,
    sun: {
      sunrise: parseTimeToHour(day.anchored.sunrise),
      sunset: parseTimeToHour(day.anchored.sunset),
      firstLight: null,
      lastLight: null
    },
    ranges: {
      waterTemp: null,
      airTemp: day.anchored.tempRange ? { min: day.anchored.tempRange[0], max: day.anchored.tempRange[1] } : null,
      pressure: day.anchored.pressureRange ? { min: day.anchored.pressureRange[0], max: day.anchored.pressureRange[1] } : null,
      wind: day.anchored.windRange ? { min: day.anchored.windRange[0], max: day.anchored.windRange[1], maxGust: null } : null,
      swell: null,
      cloudBaseline: day.anchored.cloudBaseline ?? null,
      uvPeak: null
    },
    secondary: {
      pressure: { value: hours[0]?.pressure ?? null, trend: computePressureTrend(hours) },
      waterTemp: null,
      swell: null,
      moon: {
        phaseName: day.anchored.moonPhase ?? null,
        illum: day.anchored.illumination ?? null,
        moonrise: day.anchored.moonrise ? parseTimeToHour(day.anchored.moonrise) : null,
        moonset: day.anchored.moonset ? parseTimeToHour(day.anchored.moonset) : null
      },
      rain: { chance: hours.length ? Math.max(...hours.map(item => item.rainChance)) : null, mm: null },
      uv: null,
      airTemp: { temp: hours[0]?.airTemp ?? null, feels: null }
    }
  };
}
