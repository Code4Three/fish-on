import scoringRules from "../config/scoringRules.json";
import { calculateConditionScore } from "../utils/scoringEngine.js";

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currentTimestamp: string;
}

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

export interface SecondaryMetric {
  value: number | string;
  unit: string;
  label: string;
}

export interface SecondaryMetrics {
  wind: {
    speed: number;
    direction: string;
    gusts: number;
    unit: "km/h";
  };
  pressure: {
    value: number;
    trend: string;
    unit: "hPa";
  };
  waterTemp: {
    value: number;
    unit: "°C";
  };
  swell: {
    height: number;
    direction: string;
    period: number;
    heightUnit: "m";
    periodUnit: "s";
  };
  moonPhase: {
    phase: string;
    illumination: number;
  };
  rain: {
    chance: number;
    volume: number;
    volumeUnit: "mm";
  };
  uv: {
    index: number;
    level: string;
  };
  airTemp: {
    value: number;
    feelsLike: number;
    unit: "°C";
  };
}

export interface AnchoredMetrics {
  timestamp: string;
  primaryTide: TideMetric;
  primarySolunar: SolunarMetric;
  secondaryMetrics: SecondaryMetrics;
}

export interface HourlyForecast {
  time: string;
  tideHeight: number;
  tideHeightUnit: "m";
  tideStage: string;
  solunarFeedingScore: number;
  solunarCondition: string;
  windSpeed: number;
  windSpeedUnit: "km/h";
  windDirection: string;
  pressure: number;
  pressureUnit: "hPa";
  swellHeight: number;
  swellHeightUnit: "m";
  swellDirection: string;
  swellPeriod: number;
  swellPeriodUnit: "s";
}

export interface HourlyForecastWindow extends Array<HourlyForecast> {}

export interface TideEvent {
  time: string;
  type: "High" | "Low";
  height: number;
}

export interface SolunarWindow {
  type: "Major" | "Minor";
  start: string;
  end: string;
  label: string;
}

export interface SampleMarineData {
  location: LocationInfo;
  anchoredMetrics: AnchoredMetrics;
  tideEvents: TideEvent[];
  solunarWindows: SolunarWindow[];
  hourlyForecast: HourlyForecastWindow;
}

export const sampleMarineData: SampleMarineData = {
  location: {
    name: "Mooloolaba River Mouth",
    latitude: -26.6816,
    longitude: 153.1218,
    timezone: "Australia/Brisbane",
    currentTimestamp: "2026-09-21T10:00:00+10:00"
  },
  anchoredMetrics: {
    timestamp: "2026-09-21T10:00:00+10:00",
    primaryTide: {
      height: 0.18,
      unit: "m",
      stage: "Run Out Mid",
      direction: "outgoing"
    },
    primarySolunar: {
      score: 72,
      condition: "Minor 1 (Moon rise)",
      peak: "10:42"
    },
    secondaryMetrics: {
      wind: {
        speed: 14,
        direction: "NNE",
        gusts: 19,
        unit: "km/h",
      },
      pressure: {
        value: 1023,
        trend: "Steady",
        unit: "hPa"
      },
      waterTemp: {
        value: 20,
        unit: "°C"
      },
      swell: {
        height: 0.8,
        direction: "E",
        period: 9,
        heightUnit: "m",
        periodUnit: "s"
      },
      moonPhase: {
        phase: "Waxing Gibbous",
        illumination: 65
      },
      rain: {
        chance: 10,
        volume: 0.2,
        volumeUnit: "mm"
      },
      uv: {
        index: 6,
        level: "High"
      },
      airTemp: {
        value: 21,
        feelsLike: 22,
        unit: "°C"
      }
    }
  },
  tideEvents: [
    { time: "02:47", type: "High", height: 0.72 },
    { time: "08:22", type: "Low", height: 0.12 },
    { time: "16:05", type: "High", height: 0.86 },
    { time: "22:56", type: "Low", height: 0.18 }
  ],
  solunarWindows: [
    { type: "Major", start: "06:15", end: "08:15", label: "Moon underfoot" },
    { type: "Minor", start: "10:08", end: "11:08", label: "Moon rise" },
    { type: "Major", start: "17:52", end: "19:52", label: "Moon overhead" }
  ],
  hourlyForecast: [
    {
      time: "00:00",
      tideHeight: 0.42,
      tideHeightUnit: "m",
      tideStage: "Run Out Late",
      solunarFeedingScore: 28,
      solunarCondition: "Normal",
      windSpeed: 9,
      windSpeedUnit: "km/h",
      windDirection: "NW",
      pressure: 1021,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "01:00",
      tideHeight: 0.31,
      tideHeightUnit: "m",
      tideStage: "Run Out Late",
      solunarFeedingScore: 30,
      solunarCondition: "Normal",
      windSpeed: 8,
      windSpeedUnit: "km/h",
      windDirection: "NW",
      pressure: 1021,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "02:00",
      tideHeight: 0.14,
      tideHeightUnit: "m",
      tideStage: "Low Tide",
      solunarFeedingScore: 32,
      solunarCondition: "Normal",
      windSpeed: 7,
      windSpeedUnit: "km/h",
      windDirection: "W",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.6,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "03:00",
      tideHeight: 0.1,
      tideHeightUnit: "m",
      tideStage: "Run In Start",
      solunarFeedingScore: 35,
      solunarCondition: "Normal",
      windSpeed: 7,
      windSpeedUnit: "km/h",
      windDirection: "W",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.6,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "04:00",
      tideHeight: 0.18,
      tideHeightUnit: "m",
      tideStage: "Run In Building",
      solunarFeedingScore: 39,
      solunarCondition: "Normal",
      windSpeed: 6,
      windSpeedUnit: "km/h",
      windDirection: "SW",
      pressure: 1023,
      pressureUnit: "hPa",
      swellHeight: 0.6,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "05:00",
      tideHeight: 0.34,
      tideHeightUnit: "m",
      tideStage: "Run In Mid",
      solunarFeedingScore: 43,
      solunarCondition: "Major 2 start (Moon underfoot): 05:18",
      windSpeed: 7,
      windSpeedUnit: "km/h",
      windDirection: "S",
      pressure: 1023,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "06:00",
      tideHeight: 0.55,
      tideHeightUnit: "m",
      tideStage: "Run In Late",
      solunarFeedingScore: 58,
      solunarCondition: "Major 2 (Moon underfoot): 05:18",
      windSpeed: 9,
      windSpeedUnit: "km/h",
      windDirection: "SSE",
      pressure: 1024,
      pressureUnit: "hPa",
      swellHeight: 0.8,
      swellHeightUnit: "m",
      swellDirection: "ESE",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "07:00",
      tideHeight: 0.72,
      tideHeightUnit: "m",
      tideStage: "High Tide",
      solunarFeedingScore: 64,
      solunarCondition: "Normal",
      windSpeed: 11,
      windSpeedUnit: "km/h",
      windDirection: "SSE",
      pressure: 1024,
      pressureUnit: "hPa",
      swellHeight: 0.8,
      swellHeightUnit: "m",
      swellDirection: "ESE",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "08:00",
      tideHeight: 0.64,
      tideHeightUnit: "m",
      tideStage: "Run Out Start",
      solunarFeedingScore: 61,
      solunarCondition: "Normal",
      windSpeed: 13,
      windSpeedUnit: "km/h",
      windDirection: "SE",
      pressure: 1024,
      pressureUnit: "hPa",
      swellHeight: 0.9,
      swellHeightUnit: "m",
      swellDirection: "ESE",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "09:00",
      tideHeight: 0.48,
      tideHeightUnit: "m",
      tideStage: "Run Out Building",
      solunarFeedingScore: 67,
      solunarCondition: "Minor 1 start (Moon rise): 09:42",
      windSpeed: 14,
      windSpeedUnit: "km/h",
      windDirection: "ESE",
      pressure: 1023,
      pressureUnit: "hPa",
      swellHeight: 0.9,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "10:00",
      tideHeight: 0.32,
      tideHeightUnit: "m",
      tideStage: "Run Out Mid",
      solunarFeedingScore: 72,
      solunarCondition: "Minor 1 (Moon rise): 10:42",
      windSpeed: 14,
      windSpeedUnit: "km/h",
      windDirection: "NNE",
      pressure: 1023,
      pressureUnit: "hPa",
      swellHeight: 0.8,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "11:00",
      tideHeight: 0.18,
      tideHeightUnit: "m",
      tideStage: "Run Out Late",
      solunarFeedingScore: 74,
      solunarCondition: "Minor 1 end (Moon rise): 11:42",
      windSpeed: 13,
      windSpeedUnit: "km/h",
      windDirection: "NNE",
      pressure: 1023,
      pressureUnit: "hPa",
      swellHeight: 0.8,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "12:00",
      tideHeight: 0.08,
      tideHeightUnit: "m",
      tideStage: "Low Tide",
      solunarFeedingScore: 65,
      solunarCondition: "Normal",
      windSpeed: 12,
      windSpeedUnit: "km/h",
      windDirection: "N",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "ENE",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "13:00",
      tideHeight: 0.13,
      tideHeightUnit: "m",
      tideStage: "Run In Start",
      solunarFeedingScore: 59,
      solunarCondition: "Normal",
      windSpeed: 11,
      windSpeedUnit: "km/h",
      windDirection: "N",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "ENE",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "14:00",
      tideHeight: 0.27,
      tideHeightUnit: "m",
      tideStage: "Run In Building",
      solunarFeedingScore: 54,
      solunarCondition: "Normal",
      windSpeed: 12,
      windSpeedUnit: "km/h",
      windDirection: "NNE",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.8,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "15:00",
      tideHeight: 0.44,
      tideHeightUnit: "m",
      tideStage: "Run In Mid",
      solunarFeedingScore: 51,
      solunarCondition: "Normal",
      windSpeed: 14,
      windSpeedUnit: "km/h",
      windDirection: "NE",
      pressure: 1021,
      pressureUnit: "hPa",
      swellHeight: 0.9,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "16:00",
      tideHeight: 0.59,
      tideHeightUnit: "m",
      tideStage: "Run In Late",
      solunarFeedingScore: 48,
      solunarCondition: "Normal",
      windSpeed: 15,
      windSpeedUnit: "km/h",
      windDirection: "ENE",
      pressure: 1021,
      pressureUnit: "hPa",
      swellHeight: 1,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "17:00",
      tideHeight: 0.68,
      tideHeightUnit: "m",
      tideStage: "High Tide",
      solunarFeedingScore: 45,
      solunarCondition: "Major 1 start (Moon overhead): 17:56",
      windSpeed: 16,
      windSpeedUnit: "km/h",
      windDirection: "E",
      pressure: 1020,
      pressureUnit: "hPa",
      swellHeight: 1,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "18:00",
      tideHeight: 0.6,
      tideHeightUnit: "m",
      tideStage: "Run Out Start",
      solunarFeedingScore: 62,
      solunarCondition: "Major 1 (Moon overhead): 18:56",
      windSpeed: 15,
      windSpeedUnit: "km/h",
      windDirection: "E",
      pressure: 1020,
      pressureUnit: "hPa",
      swellHeight: 1,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "19:00",
      tideHeight: 0.45,
      tideHeightUnit: "m",
      tideStage: "Run Out Building",
      solunarFeedingScore: 69,
      solunarCondition: "Major 1 end (Moon overhead): 19:56",
      windSpeed: 14,
      windSpeedUnit: "km/h",
      windDirection: "ENE",
      pressure: 1020,
      pressureUnit: "hPa",
      swellHeight: 0.9,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "20:00",
      tideHeight: 0.29,
      tideHeightUnit: "m",
      tideStage: "Run Out Mid",
      solunarFeedingScore: 57,
      solunarCondition: "Normal",
      windSpeed: 12,
      windSpeedUnit: "km/h",
      windDirection: "NE",
      pressure: 1021,
      pressureUnit: "hPa",
      swellHeight: 0.9,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 9,
      swellPeriodUnit: "s"
    },
    {
      time: "21:00",
      tideHeight: 0.14,
      tideHeightUnit: "m",
      tideStage: "Run Out Late",
      solunarFeedingScore: 44,
      solunarCondition: "Normal",
      windSpeed: 10,
      windSpeedUnit: "km/h",
      windDirection: "NNE",
      pressure: 1021,
      pressureUnit: "hPa",
      swellHeight: 0.8,
      swellHeightUnit: "m",
      swellDirection: "E",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "22:00",
      tideHeight: 0.06,
      tideHeightUnit: "m",
      tideStage: "Low Tide",
      solunarFeedingScore: 36,
      solunarCondition: "Normal",
      windSpeed: 9,
      windSpeedUnit: "km/h",
      windDirection: "N",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "ENE",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    },
    {
      time: "23:00",
      tideHeight: 0.12,
      tideHeightUnit: "m",
      tideStage: "Run In Start",
      solunarFeedingScore: 31,
      solunarCondition: "Normal",
      windSpeed: 8,
      windSpeedUnit: "km/h",
      windDirection: "NNW",
      pressure: 1022,
      pressureUnit: "hPa",
      swellHeight: 0.7,
      swellHeightUnit: "m",
      swellDirection: "ENE",
      swellPeriod: 8,
      swellPeriodUnit: "s"
    }
  ]
};

export interface ClaudeHourlyData {
  hour: number;
  tideHeight: number;
  wind: {
    speed: number;
    gust: number;
    dir: string;
  };
  solunar: "none" | "major" | "minor";
  score: number;
  scoreBand: string;
}

export interface ClaudeDayData {
  offset: number;
  phase: number;
  hours: ClaudeHourlyData[];
  tideEvents: Array<{ hour: number; type: "High" | "Low"; height: number }>;
  majorWindow: { start: number; end: number };
  minorWindows: Array<{ start: number; end: number }>;
  solunarRating: number;
  secondary: {
    pressure: { value: number; trend: "Rising" | "Falling" | "Steady" };
    waterTemp: string;
    swell: { height: string; period: number; dir: string };
    moon: { phaseName: string; illum: number };
    rain: { chance: number; mm: number };
    uv: number;
    airTemp: { temp: number; feels: number };
  };
}

const CLAUDE_COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const CLAUDE_MOON_PHASES = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
const CLAUDE_TIDE_PERIOD = 12.42;
const CLAUDE_TIDE_MEAN = 1.3;
const CLAUDE_TIDE_AMP = 0.85;

function claudeRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function claudeTideHeight(hour: number, phase: number) {
  return CLAUDE_TIDE_MEAN + CLAUDE_TIDE_AMP * Math.sin((2 * Math.PI / CLAUDE_TIDE_PERIOD) * hour + phase);
}

function claudeTideSlope(hour: number, phase: number) {
  return CLAUDE_TIDE_AMP * (2 * Math.PI / CLAUDE_TIDE_PERIOD) * Math.cos((2 * Math.PI / CLAUDE_TIDE_PERIOD) * hour + phase);
}

function claudeNormalizeHour(hour: number) {
  return ((hour % 24) + 24) % 24;
}

function claudeOverlap(startA: number, endA: number, startB: number, endB: number) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

function claudeSolunarRating(solunar: ClaudeHourlyData["solunar"]) {
  if (solunar === "major") return 90;
  if (solunar === "minor") return 60;
  return 0;
}

function claudeTideRating(hour: number, tideEvents: ClaudeDayData["tideEvents"]) {
  const peakWindowHours = scoringRules.tide?.peakWindowHours ?? 2;
  const decayPerHour = scoringRules.tide?.decayPerHour ?? 25;
  const runInWindows: Array<{ start: number; end: number }> = [];

  for (let index = 1; index < tideEvents.length; index += 1) {
    const previous = tideEvents[index - 1];
    const current = tideEvents[index];
    if (previous.type !== "Low" || current.type !== "High") continue;
    runInWindows.push({ start: current.hour - peakWindowHours, end: current.hour });
  }

  if (!runInWindows.length) return 0;

  const distanceHours = Math.min(...runInWindows.map(window => {
    if (hour >= window.start && hour <= window.end) return 0;
    return hour < window.start ? window.start - hour : hour - window.end;
  }));

  return Math.max(0, 100 - distanceHours * decayPerHour);
}

export function generateClaudeDayData(offset: number): ClaudeDayData {
  const random = claudeRandom(1000 + offset * 7919);
  const phase = ((offset * 0.85) % (2 * Math.PI)) + random() * 0.6;
  const windBase = 8 + random() * 9;
  const windDirectionBase = Math.floor(random() * 16);
  const hours: ClaudeHourlyData[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    const speed = Math.max(3, windBase + 4.5 * Math.sin(hour / 24 * Math.PI * 2 + 1) + (random() - 0.5) * 3);
    hours.push({
      hour,
      tideHeight: claudeTideHeight(hour, phase),
      wind: {
        speed: Math.round(speed),
        gust: Math.round(speed + 3 + random() * 4),
        dir: CLAUDE_COMPASS[(windDirectionBase + Math.floor(hour / 4)) % 16]
      },
      solunar: "none",
      score: 0,
      scoreBand: "Neutral"
    });
  }

  const tideEvents: ClaudeDayData["tideEvents"] = [];
  let previousSlope = claudeTideSlope(0, phase);
  for (let step = 1; step <= 24 * 12; step += 1) {
    const hour = step / 12;
    const slope = claudeTideSlope(hour, phase);
    if ((previousSlope > 0 && slope <= 0) || (previousSlope < 0 && slope >= 0)) {
      tideEvents.push({
        hour,
        type: previousSlope > 0 ? "High" : "Low",
        height: Number(claudeTideHeight(hour, phase).toFixed(1))
      });
    }
    previousSlope = slope;
  }

  const transit = claudeNormalizeHour(offset * 3.7 + random() * 5);
  const moonrise = claudeNormalizeHour(transit - 6.2);
  const moonset = claudeNormalizeHour(transit + 6.2);
  const majorWindow = { start: transit - 1, end: transit + 1 };
  const minorWindows = [
    { start: moonrise - 0.75, end: moonrise + 0.75 },
    { start: moonset - 0.75, end: moonset + 0.75 }
  ];

  hours.forEach(hour => {
    const start = hour.hour;
    const end = hour.hour + 1;
    if (claudeOverlap(start, end, majorWindow.start, majorWindow.end)) hour.solunar = "major";
    else if (minorWindows.some(window => claudeOverlap(start, end, window.start, window.end))) hour.solunar = "minor";
  });

  hours.forEach(hour => {
    const tideRating = claudeTideRating(hour.hour, tideEvents);
    const solunarRating = claudeSolunarRating(hour.solunar);
    const { score, band } = calculateConditionScore(tideRating, solunarRating, scoringRules);
    hour.score = Math.round(score);
    hour.scoreBand = band?.name ?? "Neutral";
  });

  const moonPhaseIndex = ((offset % 8) + 8) % 8;
  const moonIllumination = Math.round((1 - Math.cos(moonPhaseIndex / 8 * 2 * Math.PI)) / 2 * 100);
  const pressureTrend = ["Rising", "Falling", "Steady"][Math.floor(random() * 3)] as ClaudeDayData["secondary"]["pressure"]["trend"];
  const rainChance = Math.round(random() * 55);

  return {
    offset,
    phase,
    hours,
    tideEvents,
    majorWindow,
    minorWindows,
    solunarRating: Math.max(35, Math.min(99, Math.round(52 + moonIllumination / 100 * 28 + random() * 18))),
    secondary: {
      pressure: { value: Math.round(1000 + random() * 25), trend: pressureTrend },
      waterTemp: (20 + random() * 6).toFixed(1),
      swell: { height: (0.5 + random() * 1.5).toFixed(1), period: Math.round(6 + random() * 6), dir: CLAUDE_COMPASS[Math.floor(random() * 16)] },
      moon: { phaseName: CLAUDE_MOON_PHASES[moonPhaseIndex], illum: moonIllumination },
      rain: { chance: rainChance, mm: rainChance > 40 ? Number((random() * 4).toFixed(1)) : 0 },
      uv: Math.max(1, Math.min(11, Math.round(1 + random() * 10))),
      airTemp: { temp: Math.round(18 + random() * 9), feels: Math.round(18 + random() * 9) + Math.round(random() * 2) }
    }
  };
}
