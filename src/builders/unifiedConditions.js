import fs from "fs";
import path from "path";
import { classifyTideStage, groupTidesByDay } from "../utils/tides.js";
import { getBuildDateKeys } from "../utils/dateUtils.js";
import { calculateTideRating } from "../utils/scoringEngine.js";
import { calculateSolunarHourRating } from "../utils/solunarRating.js";
import { evalBarometricCondition } from "../utils/barometricRating.js";
import { getSecondaryDirectionRanges } from "./weather.js";

// Load scoring rules
const scoringRules = JSON.parse(fs.readFileSync(path.join("src", "config", "scoringRules.json"), "utf-8"));

// Helper: Convert date string (YYYY-MM-DD) and time string (HH:MM) to Unix timestamp (UTC)
function toTimestamp(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0)).getTime();
}

// V1 Parametric Scoring Engine (inlined for Node.js build compatibility)
const V1_CONFIG = {
  DEFAULT_WEIGHTS: { tide: 0.6, solunar: 0.4 },
  TOP_TIER_MIN: 80,
  MID_TIER_MIN: 50,
};

function calculateV1Score(tideRating, solunarRating, weights = V1_CONFIG.DEFAULT_WEIGHTS) {
  const normalizeRating = (rating) => {
    if (rating == null || isNaN(rating)) return 0;
    return Math.max(0, Math.min(100, Math.round(rating)));
  };

  const normalizedTide = normalizeRating(tideRating);
  const normalizedSolunar = normalizeRating(solunarRating);

  // Calculate combined score with parametric weights
  const score = Math.round(normalizedTide * weights.tide + normalizedSolunar * weights.solunar);
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine tier
  let tier;
  if (clampedScore >= V1_CONFIG.TOP_TIER_MIN) {
    tier = 'TOP';
  } else if (clampedScore >= V1_CONFIG.MID_TIER_MIN) {
    tier = 'MID';
  } else {
    tier = 'NEUTRAL';
  }

  return { score: clampedScore, tier };
}

export function buildUnifiedConditions() {
  // Load each generated data source; weather is optional (may not exist yet in early builds)
  const tidesPath = path.join("src", "data", "tides.json");
  const tides = JSON.parse(fs.readFileSync(tidesPath, "utf8"));

  const sunMoonPath = path.join("src", "data", "sunMoon.json");
  const sunMoon = JSON.parse(fs.readFileSync(sunMoonPath, "utf8"));

  const solunarPath = path.join("src", "data", "solunar.json");
  const solunar = JSON.parse(fs.readFileSync(solunarPath, "utf8"));

  const weatherPath = path.join("src", "data", "weather.json");
  const weather = fs.existsSync(weatherPath)
    ? JSON.parse(fs.readFileSync(weatherPath, "utf8"))
    : { days: [] };

  const groupedTides = groupTidesByDay(tides.records);
  const tideDays = new Map(groupedTides.map((day) => [day.date, day]));
  const sortedTideDays = [...groupedTides].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  // Ensure every date in the build window has an entry, even if no tide data was recorded for it
  const days = getBuildDateKeys().map(
    (date) =>
      tideDays.get(date) ?? {
        date,
        highTides: [],
        lowTides: [],
        tideEvents: [],
      },
  );

  const unified = {
    days: days.map((day) => {
      const prevDay = sortedTideDays
        .filter((candidate) => candidate.date < day.date)
        .at(-1);
      const nextDay = sortedTideDays.find(
        (candidate) => candidate.date > day.date,
      );

      // Combine the last tide event of the previous day and first of the next day with today's
      // events, so hourly interpolation near midnight has a tide event to reference on both sides
      const combinedEvents = [
        ...(prevDay?.tideEvents
          .slice(-1)
          .map((ev) => ({ ...ev, isPrevDay: true })) ?? []),
        ...day.tideEvents.map((ev) => ({ ...ev, isCurrentDay: true })),
        ...(nextDay?.tideEvents
          .slice(0, 1)
          .map((ev) => ({ ...ev, isNextDay: true })) ?? []),
      ];

      const sunMoonDay = sunMoon.days.find((d) => d.date === day.date);
      const solunarDay = solunar.days.find((d) => d.date === day.date);
      const weatherDay = weather.days.find((d) => d.date === day.date);
      const previousWeatherDay = weather.days.find((d) => d.date === prevDay?.date);

      const hourlyData = buildHourly(
        day,
        combinedEvents,
        solunarDay?.peaks ?? [],
        weatherDay?.hours ?? [],
        tides.records,
        previousWeatherDay?.hours ?? [],
      );

      // Calculate direction shifts from hourly data
      const windDirections = hourlyData.map((h) => h.windDirection).filter((d) => d != null);
      const waveDirections = hourlyData.map((h) => h.waveDirection).filter((d) => d != null);
      const windWaveDirections = hourlyData.map((h) => h.windWaveDirection).filter((d) => d != null);
      const swellWaveDirections = hourlyData.map((h) => h.swellWaveDirection).filter((d) => d != null);

      const windShift = windDirections.length ? getSecondaryDirectionRanges(windDirections) : "--";
      const waveShift = waveDirections.length ? getSecondaryDirectionRanges(waveDirections) : "--";
      const windWaveShift = windWaveDirections.length ? getSecondaryDirectionRanges(windWaveDirections) : "--";
      const swellWaveShift = swellWaveDirections.length ? getSecondaryDirectionRanges(swellWaveDirections) : "--";

      return {
        date: day.date,
        anchored: buildAnchored(day, sunMoonDay, solunarDay, weatherDay),
        hours: hourlyData,
        secondary: {
          windDirectionShift: windShift,
          waveDirectionShift: waveShift,
          windWaveDirectionShift: windWaveShift,
          swellWaveDirectionShift: swellWaveShift,
        },
      };
    }),
  };

  const outputPath = path.join("public", "conditions.json");
  fs.writeFileSync(outputPath, JSON.stringify(unified, null, 2));

  console.log("Unified conditions written → public/conditions.json");
}

function buildAnchored(day, sunMoonDay, solunarDay, weatherDay) {
  return {
    highTides: day.highTides,
    lowTides: day.lowTides,

    sunrise: sunMoonDay?.sunrise ?? null,
    sunset: sunMoonDay?.sunset ?? null,
    firstLight: sunMoonDay?.firstLight ?? null,
    lastLight: sunMoonDay?.lastLight ?? null,

    moonrise: sunMoonDay?.moonrise ?? null,
    moonset: sunMoonDay?.moonset ?? null,

    moonPhase: sunMoonDay?.moonPhase ?? null,
    illumination: sunMoonDay?.illumination ?? null,
    moonDistance: sunMoonDay?.moonDistance ?? null,
    solunarPeaks: solunarDay?.peaks ?? [],

    weatherSummary: weatherDay?.summary ?? null,
    tempRange: weatherDay?.tempRange ?? [null, null],
    windRange: weatherDay?.windRange ?? [null, null],
    windBaseline: weatherDay?.windBaseline ?? null,
    cloudBaseline: weatherDay?.cloudBaseline ?? null,
    cloudCoverLowBaseline: weatherDay?.cloudCoverLowBaseline ?? null,
    cloudCoverMidBaseline: weatherDay?.cloudCoverMidBaseline ?? null,
    cloudCoverHighBaseline: weatherDay?.cloudCoverHighBaseline ?? null,
    cloudBaseRange: weatherDay?.cloudBaseRange ?? [null, null],
    visibilityRange: weatherDay?.visibilityRange ?? [null, null],
    humidityRange: weatherDay?.humidityRange ?? [null, null],
    humidityBaseline: weatherDay?.humidityBaseline ?? null,
    dewPointRange: weatherDay?.dewPointRange ?? [null, null],
    dewPointBaseline: weatherDay?.dewPointBaseline ?? null,
    pressureRange: weatherDay?.pressureRange ?? [null, null],
    pressureBaseline: weatherDay?.pressureBaseline ?? null,
    rainChance: weatherDay?.rainChance ?? null,
    rainVolume: weatherDay?.rainVolume ?? null,
    seaSurfaceTemperatureRange:
      weatherDay?.seaSurfaceTemperatureRange ?? [null, null],
    seaSurfaceTemperatureBaseline:
      weatherDay?.seaSurfaceTemperatureBaseline ?? null,
    waveHeightRange: weatherDay?.waveHeightRange ?? [null, null],
    waveHeightMax: weatherDay?.waveHeightMax ?? null,
    waveDirection: weatherDay?.waveDirection ?? null,
    waveDirectionDominant: weatherDay?.waveDirectionDominant ?? null,
    wavePeriodRange: weatherDay?.wavePeriodRange ?? [null, null],
    wavePeriodMax: weatherDay?.wavePeriodMax ?? null,
    windWaveHeightRange: weatherDay?.windWaveHeightRange ?? [null, null],
    windWaveHeightMax: weatherDay?.windWaveHeightMax ?? null,
    windWaveDirection: weatherDay?.windWaveDirection ?? null,
    windWaveDirectionDominant:
      weatherDay?.windWaveDirectionDominant ?? null,
    windWavePeriodRange: weatherDay?.windWavePeriodRange ?? [null, null],
    windWavePeriodMax: weatherDay?.windWavePeriodMax ?? null,
    swellWaveHeightRange: weatherDay?.swellWaveHeightRange ?? [null, null],
    swellWaveHeightMax: weatherDay?.swellWaveHeightMax ?? null,
    swellWaveDirection: weatherDay?.swellWaveDirection ?? null,
    swellWaveDirectionDominant:
      weatherDay?.swellWaveDirectionDominant ?? null,
    swellWavePeriodRange: weatherDay?.swellWavePeriodRange ?? [null, null],
    swellWavePeriodMax: weatherDay?.swellWavePeriodMax ?? null,

    dayScore: null,
  };
}

function interpolateHeight(tideEvents, hourStr) {
  const [h, m] = hourStr.split(":").map(Number);
  const targetMinutes = h * 60 + m;

  const events = tideEvents.map((ev) => {
    const [eh, em] = ev.time.split(":").map(Number);
    let minutes = eh * 60 + em;

    if (ev.isPrevDay) {
      minutes -= 24 * 60; // shift previous day into negative time
    }

    if (ev.isNextDay) {
      minutes += 24 * 60; // shift next day into >1440 minutes
    }

    return { minutes, height: ev.height };
  });

  let before = null;
  let after = null;

  for (let ev of events) {
    if (ev.minutes <= targetMinutes) before = ev;
    if (ev.minutes > targetMinutes && !after) after = ev;
  }

  if (!before || !after) return null;

  const ratio =
    (targetMinutes - before.minutes) / (after.minutes - before.minutes);
  return before.height + ratio * (after.height - before.height);
}

function findBoundingTides(hourStr, tideEvents) {
  const [h, m] = hourStr.split(":").map(Number);
  const targetMinutes = h * 60 + m;

  const events = tideEvents.map((event) => {
    const [eh, em] = event.time.split(":").map(Number);

    let minutes = eh * 60 + em;

    if (event.isPrevDay) {
      minutes -= 24 * 60;
    }

    if (event.isNextDay) {
      minutes += 24 * 60;
    }

    return {
      ...event,
      minutes,
    };
  });

  let previous = null;
  let next = null;

  for (const event of events) {
    if (event.minutes <= targetMinutes) {
      previous = event;
    }

    if (event.minutes > targetMinutes && !next) {
      next = event;
    }
  }

  if (!previous || !next) {
    return null;
  }

  const progress =
    (targetMinutes - previous.minutes) / (next.minutes - previous.minutes);

  const direction =
    previous.type === "Low" && next.type === "High" ? "incoming" : "outgoing";

  return {
    start: previous,
    end: next,
    direction,
    progress,
  };
}

function buildHourly(day, tideEvents, solunarPeaks, weatherHours = [], tideRecords = [], previousDayWeatherHours = []) {
  const hours = [];

  for (let h = 0; h < 24; h++) {
    const hourStr = h.toString().padStart(2, "0") + ":00";

    hours.push({
      time: hourStr,
      height: interpolateHeight(tideEvents, hourStr),
    });
  }

  const weatherLookup = new Map(
    (weatherHours ?? []).map((hour) => [hour.time, hour]),
  );
  const previousWeatherLookup = new Map(
    (previousDayWeatherHours ?? []).map((hour) => [hour.time, hour]),
  );

  // Build tide timeline for rating calculation
  // Convert raw tide records to the format expected by calculateTideRating
  const tideTimeline = tideRecords
    .map((record) => ({
      type: record.type,
      at: new Date(record.date).getTime(),
    }))
    .sort((a, b) => a.at - b.at);

  // Create a day-like object with anchored solunar peaks for rating calculation
  const dayForSolunarRating = {
    date: day.date,
    anchored: { solunarPeaks }
  };

  return hours.map((hour, h) => {
    const boundingTides = findBoundingTides(hour.time, tideEvents);

    const tideStage = boundingTides
      ? classifyTideStage(boundingTides.progress, boundingTides.direction)
      : "Unknown";

    const weather = weatherLookup.get(hour.time) ?? {};

    // Calculate ratings for V1 scoring
    const at = toTimestamp(day.date, hour.time);
    const tideRating = calculateTideRating(at, tideTimeline, scoringRules);
    const solunarRating = calculateSolunarHourRating(dayForSolunarRating, hour.time, scoringRules);
    const v1Score = calculateV1Score(tideRating, solunarRating);

    // 3-hour pressure lookback can span into the previous day near midnight
    const hourOfLookback = h - 3;
    const pressure3HoursAgo = hourOfLookback >= 0
      ? weatherLookup.get(`${hourOfLookback.toString().padStart(2, "0")}:00`)?.pressure ?? null
      : previousWeatherLookup.get(`${(24 + hourOfLookback).toString().padStart(2, "0")}:00`)?.pressure ?? null;
    const barometric = evalBarometricCondition(
      { currentHpa: weather.pressure ?? null, hpa3HoursAgo: pressure3HoursAgo },
      scoringRules,
    );

    return {
      time: hour.time,
      height: hour.height,
      tideStage,
      tideRating,
      v1Score,

      solunarCondition: getSolunarCondition(day.date, hour.time, solunarPeaks),
      pressureTrend:
        weather.pressure != null ? `${weather.pressure} hPa` : null,
      pressure: weather.pressure ?? null,
      barometric,
      weatherCondition: weather.weatherCondition ?? null,
      wind:
        weather.windSpeed != null
          ? `${weather.windSpeed} km/h${weather.windDirection ? ` ${weather.windDirection}` : ""}`
          : null,
      windSpeed: weather.windSpeed ?? null,
      windGust: weather.windGust ?? null,
      windDirection: weather.windDirection ?? null,
      temperature: weather.temperature ?? null,
      feelsLike: weather.feelsLike ?? null,
      humidity: weather.humidity ?? null,
      dewPoint: weather.dewPoint ?? null,
      cloudCover: weather.cloudCover ?? null,
      cloudCoverLow: weather.cloudCoverLow ?? null,
      cloudCoverMid: weather.cloudCoverMid ?? null,
      cloudCoverHigh: weather.cloudCoverHigh ?? null,
      cloudBase: weather.cloudBase ?? null,
      visibility: weather.visibility ?? null,
      rainChance: weather.rainChance ?? null,
      rainVolume: weather.rainVolume ?? null,
      uvIndex: weather.uvIndex ?? null,
      seaSurfaceTemperature: weather.seaSurfaceTemperature ?? null,
      waveHeight: weather.waveHeight ?? null,
      waveDirection: weather.waveDirection ?? null,
      wavePeriod: weather.wavePeriod ?? null,
      windWaveHeight: weather.windWaveHeight ?? null,
      windWaveDirection: weather.windWaveDirection ?? null,
      windWavePeriod: weather.windWavePeriod ?? null,
      swellWaveHeight: weather.swellWaveHeight ?? null,
      swellWaveDirection: weather.swellWaveDirection ?? null,
      swellWavePeriod: weather.swellWavePeriod ?? null,
    };
  });
}

function getSolunarCondition(date, hourStr, peaks) {
  const hour = Number(hourStr.slice(0, 2));
  const hourStart = hour * 60;
  const hourEnd = hourStart + 60;
  const conditions = [];

  for (const peak of peaks) {
    if (!peak.start || !peak.end) continue;

    const start = getDayMinutes(date, peak.start);
    const end = getDayMinutes(date, peak.end);

    const hasBoundary =
      isWithinHour(start, hourStart, hourEnd) ||
      isWithinHour(end, hourStart, hourEnd);

    if (isWithinHour(start, hourStart, hourEnd)) {
      conditions.push(
        formatSolunarBoundary(peak.type, "start", peak.start.time),
      );
    }

    if (isWithinHour(end, hourStart, hourEnd)) {
      conditions.push(formatSolunarBoundary(peak.type, "end", peak.end.time));
    }

    if (!hasBoundary && start < hourEnd && end > hourStart) {
      conditions.push(`${peak.type}: ${peak.time}`);
    }
  }

  return conditions.length ? conditions.join(" / ") : "Normal";
}

function formatSolunarBoundary(type, boundary, time) {
  const match = type.match(/^(Major|Minor) (\d+) \((.+)\)$/);

  return match
    ? `${match[1]} ${match[2]} ${boundary} (${match[3]}): ${time}`
    : `${type} ${boundary}: ${time}`;
}

function getDayMinutes(dayDate, point) {
  const dayOffset = point.date < dayDate ? -1 : point.date > dayDate ? 1 : 0;
  const [hour, minute] = point.time.split(":").map(Number);
  return dayOffset * 24 * 60 + hour * 60 + minute;
}

function isWithinHour(minutes, start, end) {
  return minutes >= start && minutes < end;
}
