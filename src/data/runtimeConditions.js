import { getLocationDateKey } from "../api/openMeteo.js";
import { classifyTideStage } from "../utils/tides.js";
import { getZonedInstant } from "./runtimeAstronomy.js";
import {
  loadRuntimeLocationData,
  writeDevelopmentSnapshot,
} from "./runtimeData.js";

const WEATHER_LABELS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy showers",
  82: "Violent showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

const WIND_DIRECTIONS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
];

const CURRENT_MAX_AGE_MS = 15 * 60 * 1000;

function toCompassDirection(degrees) {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) return null;
  return WIND_DIRECTIONS[Math.round((degrees % 360) / 22.5) % 16];
}

function formatObservedMetric(value, unit = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = String(Number(value.toFixed(1)));
  if (unit === "%" || unit.startsWith("°")) return `${normalized}${unit}`;
  return unit ? `${normalized} ${unit}` : normalized;
}

export function applyCurrentObservation(day, currentRecord, timezone, now = new Date()) {
  const observation = currentRecord?.values;
  const fetchedAt = Date.parse(currentRecord?.fetchedAt ?? "");
  const observationTime = currentRecord?.timestamp;
  if (
    !observation ||
    !Number.isFinite(fetchedAt) ||
    now.getTime() - fetchedAt < 0 ||
    now.getTime() - fetchedAt > CURRENT_MAX_AGE_MS ||
    typeof observationTime !== "string"
  ) {
    return day;
  }

  const today = getLocationDateKey(now, timezone);
  const localHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
  const [observationDate, observationClock] = observationTime.split("T");
  const observationHour = Number(observationClock?.slice(0, 2));
  if (
    day.date !== today ||
    observationDate !== today ||
    observationHour !== localHour
  ) {
    return day;
  }

  const hourRecord = day.hours[localHour];
  if (!hourRecord) return day;
  const updatedDay = {
    ...day,
    hours: [...day.hours],
    secondary: { ...day.secondary },
  };

  const hasNumber = (value) =>
    typeof value === "number" && Number.isFinite(value);
  const windDirection = toCompassDirection(observation.wind_direction_10m);
  const nextWind = {
    speed: hasNumber(observation.wind_speed_10m)
      ? observation.wind_speed_10m
      : hourRecord.wind.speed,
    gust: hasNumber(observation.wind_gusts_10m)
      ? observation.wind_gusts_10m
      : hourRecord.wind.gust,
    dir: windDirection ?? hourRecord.wind.dir,
  };
  const airTemp = hasNumber(observation.temperature_2m)
    ? observation.temperature_2m
    : hourRecord.airTemp;
  const feelsLike = hasNumber(observation.apparent_temperature)
    ? observation.apparent_temperature
    : hourRecord.feelsLike;
  const pressure = hasNumber(observation.surface_pressure)
    ? observation.surface_pressure
    : hourRecord.pressure;
  const humidity = hasNumber(observation.relative_humidity_2m)
    ? observation.relative_humidity_2m
    : hourRecord.humidity;
  const cloudCover = hasNumber(observation.cloud_cover)
    ? observation.cloud_cover
    : hourRecord.cloudCover;
  const rainVolume = hasNumber(observation.precipitation)
    ? observation.precipitation
    : hourRecord.rainVolume;
  const weatherCondition = WEATHER_LABELS[observation.weather_code]
    ?? hourRecord.weatherCondition;

  const environmentalValues = {
    ...hourRecord.environmentalValues,
    airTemperature: formatObservedMetric(airTemp, "°C")
      ?? hourRecord.environmentalValues.airTemperature,
    feelsLike: formatObservedMetric(feelsLike, "°C")
      ?? hourRecord.environmentalValues.feelsLike,
    pressure: formatObservedMetric(pressure, "hPa")
      ?? hourRecord.environmentalValues.pressure,
    humidity: formatObservedMetric(humidity, "%")
      ?? hourRecord.environmentalValues.humidity,
    cloud: formatObservedMetric(cloudCover, "%")
      ?? hourRecord.environmentalValues.cloud,
    rainVolume: formatObservedMetric(rainVolume, "mm")
      ?? hourRecord.environmentalValues.rainVolume,
  };
  const environmentalRawValues = {
    ...hourRecord.environmentalRawValues,
    airTemperature: airTemp,
    feelsLike,
    pressure,
    humidity,
    cloud: cloudCover,
    rainVolume,
  };

  updatedDay.hours[localHour] = {
    ...hourRecord,
    weatherSource: "current",
    airTemp,
    feelsLike,
    pressure,
    pressureTrend: hasNumber(observation.surface_pressure)
      ? `${observation.surface_pressure} hPa`
      : hourRecord.pressureTrend,
    humidity,
    cloudCover,
    rainVolume,
    weatherCondition,
    wind: nextWind,
    windLabel: `${nextWind.speed} km/h${nextWind.dir ? ` ${nextWind.dir}` : ""}`,
    environmentalValues,
    environmentalRawValues,
  };

  updatedDay.secondary = {
    ...updatedDay.secondary,
    pressure: {
      ...updatedDay.secondary.pressure,
      value: pressure,
    },
    rain: {
      ...updatedDay.secondary.rain,
      mm: rainVolume,
    },
    airTemp: {
      temp: airTemp,
      feels: feelsLike,
    },
  };

  return updatedDay;
}

function finiteValues(values) {
  return values.filter((value) => typeof value === "number" && Number.isFinite(value));
}

function getRange(values, precision = 0) {
  const validValues = finiteValues(values);
  if (!validValues.length) return [null, null];
  const multiplier = 10 ** precision;
  return [
    Math.round(Math.min(...validValues) * multiplier) / multiplier,
    Math.round(Math.max(...validValues) * multiplier) / multiplier,
  ];
}

function getAverage(values, precision = 0) {
  const validValues = finiteValues(values);
  if (!validValues.length) return null;
  const multiplier = 10 ** precision;
  return (
    Math.round(
      (validValues.reduce((total, value) => total + value, 0) /
        validValues.length) *
      multiplier,
    ) / multiplier
  );
}

function getMostCommon(values) {
  const counts = new Map();
  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts].sort((first, second) => second[1] - first[1])[0]?.[0] ?? null;
}

function getLocalPoint(timestamp, timezone) {
  const date = new Date(timestamp);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function normalizeWeatherHour(hourRecord) {
  const weather = hourRecord?.weather ?? {};
  const marine = hourRecord?.marine ?? {};
  const windSpeed = weather.wind_speed_10m ?? null;
  const windDirection = toCompassDirection(weather.wind_direction_10m);
  const pressure = weather.surface_pressure ?? null;

  return {
    time: hourRecord?.time ?? null,
    temperature: weather.temperature_2m ?? null,
    feelsLike: weather.apparent_temperature ?? null,
    humidity: weather.relative_humidity_2m ?? null,
    dewPoint: weather.dew_point_2m ?? null,
    pressure,
    pressureTrend: pressure == null ? null : `${pressure} hPa`,
    cloudCover: weather.cloud_cover ?? null,
    cloudCoverLow: weather.cloud_cover_low ?? null,
    cloudCoverMid: weather.cloud_cover_mid ?? null,
    cloudCoverHigh: weather.cloud_cover_high ?? null,
    cloudBase: weather.cloud_base ?? null,
    visibility: typeof weather.visibility === "number"
      ? weather.visibility / 1000
      : null,
    rainChance: weather.precipitation_probability ?? null,
    rainVolume: weather.precipitation ?? null,
    windSpeed,
    windGust: weather.wind_gusts_10m ?? null,
    windDirection,
    wind: windSpeed == null
      ? null
      : `${windSpeed} km/h${windDirection ? ` ${windDirection}` : ""}`,
    uvIndex: weather.uv_index ?? null,
    weatherCondition: WEATHER_LABELS[weather.weather_code] ?? "Variable conditions",
    seaSurfaceTemperature: marine.sea_surface_temperature ?? null,
    waveHeight: marine.wave_height ?? null,
    waveDirection: toCompassDirection(marine.wave_direction),
    wavePeriod: marine.wave_period ?? null,
    windWaveHeight: marine.wind_wave_height ?? null,
    windWaveDirection: toCompassDirection(marine.wind_wave_direction),
    windWavePeriod: marine.wind_wave_period ?? null,
    swellWaveHeight: marine.swell_wave_height ?? null,
    swellWaveDirection: toCompassDirection(marine.swell_wave_direction),
    swellWavePeriod: marine.swell_wave_period ?? null,
  };
}

function findBoundingTides(timestamp, tideEvents) {
  let previous = null;
  let next = null;
  tideEvents.forEach((event) => {
    if (event.at <= timestamp) previous = event;
    if (event.at > timestamp && !next) next = event;
  });
  if (!previous || !next) return null;

  const progress = (timestamp - previous.at) / (next.at - previous.at);
  return {
    previous,
    next,
    progress,
    direction:
      previous.type === "Low" && next.type === "High" ? "incoming" : "outgoing",
  };
}

function getTideHeight(timestamp, tideEvents) {
  const bounds = findBoundingTides(timestamp, tideEvents);
  if (!bounds) return null;
  return bounds.previous.height +
    (bounds.next.height - bounds.previous.height) * bounds.progress;
}

function getSolunarCondition(timestamp, date, peaks, timezone) {
  const activePeaks = peaks.filter((peak) => {
    if (!peak.start || !peak.end) return false;
    const start = getZonedInstant(
      peak.start.date,
      Number(peak.start.time.slice(0, 2)),
      Number(peak.start.time.slice(3, 5)),
      timezone,
    ).getTime();
    const end = getZonedInstant(
      peak.end.date,
      Number(peak.end.time.slice(0, 2)),
      Number(peak.end.time.slice(3, 5)),
      timezone,
    ).getTime();
    return timestamp >= start && timestamp < end;
  });
  return activePeaks.length
    ? activePeaks.map((peak) => `${peak.type}: ${peak.time}`).join(" / ")
    : "Normal";
}

function buildAnchored(dateRecord, astronomy, dayHours, tideEvents, location) {
  const daily = dateRecord.daily ?? {};
  const marineDaily = dateRecord.marineDaily ?? {};
  const localTides = tideEvents
    .map((event) => ({ ...event, ...getLocalPoint(event.timestamp, location.timezone) }))
    .filter((event) => event.date === dateRecord.date);
  const windMax = daily.wind_speed_10m_max ?? null;
  const windDirection = toCompassDirection(daily.wind_direction_10m_dominant);
  const cloudBaseline = getAverage(dayHours.map((hour) => hour.cloudCover));
  const waveHeights = dayHours.map((hour) => hour.waveHeight);
  const windWaveHeights = dayHours.map((hour) => hour.windWaveHeight);
  const swellHeights = dayHours.map((hour) => hour.swellWaveHeight);

  return {
    highTides: localTides
      .filter((event) => event.type === "High")
      .map((event) => ({ time: event.time, height: event.height })),
    lowTides: localTides
      .filter((event) => event.type === "Low")
      .map((event) => ({ time: event.time, height: event.height })),
    sunrise: astronomy?.sunrise ?? null,
    sunset: astronomy?.sunset ?? null,
    firstLight: astronomy?.firstLight ?? null,
    lastLight: astronomy?.lastLight ?? null,
    moonrise: astronomy?.moonrise ?? null,
    moonset: astronomy?.moonset ?? null,
    moonPhase: astronomy?.moonPhase ?? null,
    illumination: astronomy?.illumination ?? null,
    moonDistance: astronomy?.moonDistance ?? null,
    solunarPeaks: astronomy?.solunarPeaks ?? [],
    weatherSummary: WEATHER_LABELS[daily.weather_code] ?? "Variable conditions",
    tempRange: [daily.temperature_2m_min ?? null, daily.temperature_2m_max ?? null],
    windRange: windMax == null ? [null, null] : [Math.max(0, windMax - 6), windMax],
    windBaseline: windMax == null ? null : `${windMax} km/h${windDirection ? ` ${windDirection}` : ""}`,
    cloudBaseline,
    cloudRange: getRange(dayHours.map((hour) => hour.cloudCover)),
    cloudCoverLowBaseline: getAverage(dayHours.map((hour) => hour.cloudCoverLow)),
    cloudCoverLowRange: getRange(dayHours.map((hour) => hour.cloudCoverLow)),
    cloudCoverMidBaseline: getAverage(dayHours.map((hour) => hour.cloudCoverMid)),
    cloudCoverMidRange: getRange(dayHours.map((hour) => hour.cloudCoverMid)),
    cloudCoverHighBaseline: getAverage(dayHours.map((hour) => hour.cloudCoverHigh)),
    cloudCoverHighRange: getRange(dayHours.map((hour) => hour.cloudCoverHigh)),
    cloudBaseRange: getRange(dayHours.map((hour) => hour.cloudBase)),
    visibilityRange: getRange(dayHours.map((hour) => hour.visibility), 2),
    humidityRange: getRange(dayHours.map((hour) => hour.humidity)),
    humidityBaseline: getAverage(dayHours.map((hour) => hour.humidity)),
    dewPointRange: getRange(dayHours.map((hour) => hour.dewPoint), 1),
    dewPointBaseline: getAverage(dayHours.map((hour) => hour.dewPoint), 1),
    pressureRange: getRange(dayHours.map((hour) => hour.pressure)),
    pressureBaseline: daily.surface_pressure_mean ?? getAverage(dayHours.map((hour) => hour.pressure)),
    rainChance: daily.precipitation_probability_max ?? null,
    rainVolume: daily.precipitation_sum ?? null,
    seaSurfaceTemperatureRange: getRange(dayHours.map((hour) => hour.seaSurfaceTemperature), 1),
    seaSurfaceTemperatureBaseline: getAverage(dayHours.map((hour) => hour.seaSurfaceTemperature), 1),
    waveHeightRange: getRange(waveHeights, 1),
    waveHeightMax: getRange(waveHeights, 1)[1],
    waveDirection: getMostCommon(dayHours.map((hour) => hour.waveDirection)),
    waveDirectionDominant: toCompassDirection(marineDaily.wave_direction_dominant),
    wavePeriodRange: getRange(dayHours.map((hour) => hour.wavePeriod), 1),
    wavePeriodMax: getRange(dayHours.map((hour) => hour.wavePeriod), 1)[1],
    windWaveHeightRange: getRange(windWaveHeights, 1),
    windWaveHeightMax: getRange(windWaveHeights, 1)[1],
    windWaveDirection: getMostCommon(dayHours.map((hour) => hour.windWaveDirection)),
    windWaveDirectionDominant: toCompassDirection(marineDaily.wind_wave_direction_dominant),
    windWavePeriodRange: getRange(dayHours.map((hour) => hour.windWavePeriod), 1),
    windWavePeriodMax: getRange(dayHours.map((hour) => hour.windWavePeriod), 1)[1],
    swellWaveHeightRange: getRange(swellHeights, 1),
    swellWaveHeightMax: getRange(swellHeights, 1)[1],
    swellWaveDirection: getMostCommon(dayHours.map((hour) => hour.swellWaveDirection)),
    swellWaveDirectionDominant: toCompassDirection(marineDaily.swell_wave_direction_dominant),
    swellWavePeriodRange: getRange(dayHours.map((hour) => hour.swellWavePeriod), 1),
    swellWavePeriodMax: getRange(dayHours.map((hour) => hour.swellWavePeriod), 1)[1],
    dayScore: null,
  };
}

function buildConditionsDay(dateRecord, astronomy, location, tides) {
  const tideEvents = tides
    .map((event) => ({ ...event, at: Date.parse(event.timestamp) }))
    .filter((event) => Number.isFinite(event.at))
    .sort((first, second) => first.at - second.at);
  const hourlyLookup = new Map(
    dateRecord.hours.map((hourRecord) => [hourRecord.time, hourRecord]),
  );
  const dayHours = Array.from({ length: 24 }, (_, hourIndex) => {
    const time = `${String(hourIndex).padStart(2, "0")}:00`;
    const hour = normalizeWeatherHour(hourlyLookup.get(time));
    const timestamp = getZonedInstant(
      dateRecord.date,
      hourIndex,
      0,
      location.timezone,
    ).getTime();
    const boundingTides = findBoundingTides(timestamp, tideEvents);
    return {
      ...hour,
      time,
      height: getTideHeight(timestamp, tideEvents),
      tideStage: boundingTides
        ? classifyTideStage(boundingTides.progress, boundingTides.direction)
        : "Unknown",
      solunarCondition: getSolunarCondition(
        timestamp,
        dateRecord.date,
        astronomy?.solunarPeaks ?? [],
        location.timezone,
      ),
    };
  });

  return {
    date: dateRecord.date,
    anchored: buildAnchored(dateRecord, astronomy, dayHours, tideEvents, location),
    hours: dayHours,
  };
}

export function toDashboardData(runtimeData, location) {
  const astronomyByDate = new Map(
    runtimeData.astronomy.map((record) => [record.date, record]),
  );
  const days = runtimeData.forecast.map((dateRecord) =>
    buildConditionsDay(
      dateRecord,
      astronomyByDate.get(dateRecord.date),
      location,
      runtimeData.tides,
    ),
  );

  return {
    days,
    current: runtimeData.current,
    history: runtimeData.history,
    locationKey: runtimeData.locationKey,
    errors: runtimeData.errors,
  };
}

async function mirrorDashboardSnapshot(runtimeData, dashboardData, location) {
  try {
    await writeDevelopmentSnapshot({
      schemaVersion: 1,
      locationKey: runtimeData.locationKey,
      location: {
        id: location.id,
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        timezone: location.timezone,
      },
      snapshotAt: new Date().toISOString(),
      days: dashboardData.days,
      data: {
        current: runtimeData.current,
        history: runtimeData.history,
        forecast: runtimeData.forecast,
        tides: runtimeData.tides,
        astronomy: runtimeData.astronomy,
        refresh: runtimeData.refresh,
      },
    });
  } catch {
    // The dev mirror is optional and must not block dashboard data.
  }
}

export async function fetchRuntimeConditions(
  location,
  now = new Date(),
  onCacheReady,
) {
  const handleCacheReady = (runtimeData) => {
    const dashboardData = toDashboardData(runtimeData, location);
    onCacheReady?.(dashboardData);
    void mirrorDashboardSnapshot(runtimeData, dashboardData, location);
  };
  const runtimeData = await loadRuntimeLocationData(
    location,
    now,
    handleCacheReady,
  );
  const dashboardData = toDashboardData(runtimeData, location);
  await mirrorDashboardSnapshot(runtimeData, dashboardData, location);
  return dashboardData;
}

export function getRuntimeTodayIndex(days, timezone, now = new Date()) {
  const today = getLocationDateKey(now, timezone);
  return days.findIndex((day) => day.date === today);
}