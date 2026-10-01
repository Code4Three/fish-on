import fs from "fs";
import path from "path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { DISPLAY_DAYS, LOCATION, TIME_ZONE } from "../config/constants.js";
import { formatLocalDate } from "../utils/dateUtils.js";

const executeFile = promisify(execFile);

const WEATHER_CODE_LABELS = {
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
  90: "Thunderstorm",
  91: "Thunderstorm rain",
  92: "Heavy thunderstorm",
  93: "Severe thunderstorm",
};

function getWeatherLabel(code) {
  return WEATHER_CODE_LABELS[code] ?? "Variable conditions";
}

function getWindDirectionLabel(degrees) {
  if (degrees == null) return null;
  const directions = [
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
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

function round(value, decimalPlaces = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const multiplier = 10 ** decimalPlaces;
  return Math.round(value * multiplier) / multiplier;
}

function roundPercentage(value) {
  if (typeof value !== "number" || value < 0 || value > 100) return null;
  return round(value);
}

function roundNonNegative(value, decimalPlaces = 0) {
  if (typeof value !== "number" || value < 0) return null;
  return round(value, decimalPlaces);
}

function getHourlyMetricValues(hours, key) {
  return hours
    .map((hour) => hour[key])
    .filter((value) => typeof value === "number" && Number.isFinite(value));
}

function getHourlyMetricRange(hours, key, decimalPlaces = 0) {
  const values = getHourlyMetricValues(hours, key);
  if (!values.length) return [null, null];
  return [round(Math.min(...values), decimalPlaces), round(Math.max(...values), decimalPlaces)];
}

function getHourlyMetricAverage(hours, key, decimalPlaces = 0) {
  const values = getHourlyMetricValues(hours, key);
  if (!values.length) return null;
  return round(values.reduce((total, value) => total + value, 0) / values.length, decimalPlaces);
}

function getMostCommonHourlyValue(hours, key) {
  const counts = new Map();
  for (const hour of hours) {
    const value = hour[key];
    if (value != null) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort((first, second) => second[1] - first[1])[0]?.[0] ?? null;
}

/**
 * Returns wind/wave direction shifts and percentages for every sector present in the hourly data.
 * 
 * @param {Array<number|string>} hourlyData - 24-hour array of wind degrees or direction strings
 * @param {number} minHours - Minimum duration threshold (default: 3)
 * @returns {string} Formatted direction ranges (e.g., "SW (12.5%), SE (12.5%)") or "--"
 */
export function getSecondaryDirectionRanges(hourlyData, minHours = 3) {
  if (!hourlyData?.length) return '--';

  const pts = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const normMap = {
    N: 'N', NNE: 'N', NE: 'NE', ENE: 'E',
    E: 'E', ESE: 'E', SE: 'SE', SSE: 'S',
    S: 'S', SSW: 'S', SW: 'SW', WSW: 'W',
    W: 'W', WNW: 'W', NW: 'NW', NNW: 'N',
  };

  // Helper to normalize degrees or 16-point strings to 8 primary sectors
  const to8Point = (v) => typeof v === 'number'
    ? pts[Math.round((v % 360) / 45) % 8]
    : (normMap[v?.toUpperCase()] || v?.toUpperCase());

  const counts = {};
  const total = hourlyData.length;

  for (let i = 0; i < total; i++) {
    const sector = to8Point(hourlyData[i]);
    if (sector) counts[sector] = (counts[sector] || 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= minHours)
    .sort((a, b) => b[1] - a[1])
    .map(([sector, count]) => {
      const pct = ((count / total) * 100).toFixed(1).replace('.0', '');
      return `${sector} (${pct}%)`;
    })
    .join(', ') || '--';
}

async function fetchWeatherWithRetry(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      lastError = error;
    }

    if (response?.ok) return response;

    if (response) {
      lastError = new Error(
        `Open-Meteo request failed with status ${response.status}`,
      );
      if (response.status < 500 && response.status !== 429) throw lastError;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError;
}

async function fetchMarineData(url) {
  try {
    const response = await fetchWeatherWithRetry(url);
    return await response.json();
  } catch (fetchError) {
    try {
      const { stdout } = await executeFile(
        "curl",
        [
          "--fail",
          "--silent",
          "--show-error",
          "--retry",
          "2",
          "--retry-all-errors",
          "--max-time",
          "30",
          url,
        ],
        { maxBuffer: 10 * 1024 * 1024 },
      );
      return JSON.parse(stdout);
    } catch (curlError) {
      throw new AggregateError(
        [fetchError, curlError],
        "Open-Meteo marine request failed with both fetch and curl",
      );
    }
  }
}

export async function buildWeatherData() {
  const fallbackPath = path.join("src", "data", "weather.json");

  try {
    const params = new URLSearchParams({
      latitude: String(LOCATION.lat),
      longitude: String(LOCATION.lon),
      timezone: TIME_ZONE,
      forecast_days: String(DISPLAY_DAYS),
      hourly: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "dew_point_2m",
        "surface_pressure",
        "cloud_cover",
        "cloud_cover_low",
        "cloud_cover_mid",
        "cloud_cover_high",
        "cloud_base",
        "visibility",
        "precipitation_probability",
        "precipitation",
        "wind_speed_10m",
        "wind_gusts_10m",
        "wind_direction_10m",
        "uv_index",
        "weather_code",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "wind_direction_10m_dominant",
        "uv_index_max",
        "surface_pressure_mean",
      ].join(","),
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetchWeatherWithRetry(url);

    const weather = await response.json();
    let marine = {};

    try {
      const marineParams = new URLSearchParams({
        latitude: String(LOCATION.lat),
        longitude: String(LOCATION.lon),
        timezone: TIME_ZONE,
        forecast_days: String(DISPLAY_DAYS),
        hourly: [
          "sea_surface_temperature",
          "wave_height",
          "wave_direction",
          "wave_period",
          "wind_wave_height",
          "wind_wave_direction",
          "wind_wave_period",
          "swell_wave_height",
          "swell_wave_direction",
          "swell_wave_period",
        ].join(","),
        daily: [
          "wave_height_max",
          "wave_direction_dominant",
          "wave_period_max",
          "wind_wave_height_max",
          "wind_wave_direction_dominant",
          "wind_wave_period_max",
          "swell_wave_height_max",
          "swell_wave_direction_dominant",
          "swell_wave_period_max",
        ].join(","),
      });
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?${marineParams.toString()}`;
      marine = await fetchMarineData(marineUrl);
    } catch (error) {
      console.warn("Open-Meteo marine fetch failed; marine metrics will be null.", {
        message: error.message,
        cause: error.cause?.code ?? error.cause?.message ?? null,
      });
    }

    return processWeatherResponse(weather, marine);
  } catch (error) {
    console.warn(
      "Open-Meteo weather fetch failed after retries; using cached weather data fallback.",
      {
        message: error.message,
        cause: error.cause?.code ?? error.cause?.message ?? null,
      },
    );

    if (fs.existsSync(fallbackPath)) {
      const cachedWeather = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      if (cachedWeather?.days?.length) {
        return cachedWeather;
      }
    }

    return { days: [] };
  }
}

export function processWeatherResponse(weather, marine = {}) {
  const hourlyByDate = new Map();
  const weatherHourly = weather?.hourly ?? {};
  const weatherDaily = weather?.daily ?? {};
  const marineHourly = marine?.hourly ?? {};
  const marineDaily = marine?.daily ?? {};
  const hourlyTimes = Array.isArray(weatherHourly.time) ? weatherHourly.time : [];
  const dailyDates = Array.isArray(weatherDaily.time) ? weatherDaily.time : [];
  const marineTimes = Array.isArray(marineHourly.time) ? marineHourly.time : [];
  const marineDailyDates = Array.isArray(marineDaily.time) ? marineDaily.time : [];
  const marineByTime = new Map();
  const marineDailyByDate = new Map(
    marineDailyDates.map((date, index) => [date, index]),
  );

  for (let index = 0; index < marineTimes.length; index += 1) {
    const isoTime = marineTimes[index];
    if (typeof isoTime === "string") marineByTime.set(isoTime, index);
  }

  for (let i = 0; i < hourlyTimes.length; i += 1) {
    const isoTime = hourlyTimes[i];
    if (typeof isoTime !== "string" || !isoTime.includes("T")) continue;
    // Open-Meteo returns hourly timestamps in the requested local timezone.
    const [date, localTime] = isoTime.split("T");
    const hour = localTime.slice(0, 2);
    const marineIndex = marineByTime.get(isoTime);
    const marineValue = (key, decimalPlaces = 0) =>
      marineIndex == null
        ? null
        : round(marineHourly[key]?.[marineIndex], decimalPlaces);
    const entry = {
      time: `${hour}:00`,
      temperature: round(weatherHourly.temperature_2m?.[i]),
      feelsLike: round(weatherHourly.apparent_temperature?.[i]),
      humidity: roundPercentage(weatherHourly.relative_humidity_2m?.[i]),
      dewPoint: round(weatherHourly.dew_point_2m?.[i], 1),
      pressure: round(weatherHourly.surface_pressure?.[i]),
      cloudCover: roundPercentage(weatherHourly.cloud_cover?.[i]),
      cloudCoverLow: roundPercentage(weatherHourly.cloud_cover_low?.[i]),
      cloudCoverMid: roundPercentage(weatherHourly.cloud_cover_mid?.[i]),
      cloudCoverHigh: roundPercentage(weatherHourly.cloud_cover_high?.[i]),
      cloudBase: roundNonNegative(weatherHourly.cloud_base?.[i]),
      visibility:
        typeof weatherHourly.visibility?.[i] === "number"
          ? roundNonNegative(weatherHourly.visibility[i] / 1000, 2)
          : null,
      rainChance: roundPercentage(weatherHourly.precipitation_probability?.[i]),
      rainVolume: roundNonNegative(weatherHourly.precipitation?.[i], 1),
      windSpeed: roundNonNegative(weatherHourly.wind_speed_10m?.[i]),
      windGust: roundNonNegative(weatherHourly.wind_gusts_10m?.[i]),
      windDirection: getWindDirectionLabel(
        weatherHourly.wind_direction_10m?.[i],
      ),
      uvIndex: roundNonNegative(weatherHourly.uv_index?.[i]),
      seaSurfaceTemperature: marineValue("sea_surface_temperature", 1),
      waveHeight: roundNonNegative(marineValue("wave_height", 1), 1),
      waveDirection: getWindDirectionLabel(marineValue("wave_direction")),
      wavePeriod: roundNonNegative(marineValue("wave_period", 1), 1),
      windWaveHeight: roundNonNegative(marineValue("wind_wave_height", 1), 1),
      windWaveDirection: getWindDirectionLabel(marineValue("wind_wave_direction")),
      windWavePeriod: roundNonNegative(marineValue("wind_wave_period", 1), 1),
      swellWaveHeight: roundNonNegative(marineValue("swell_wave_height", 1), 1),
      swellWaveDirection: getWindDirectionLabel(marineValue("swell_wave_direction")),
      swellWavePeriod: roundNonNegative(marineValue("swell_wave_period", 1), 1),
      weatherCondition: getWeatherLabel(weatherHourly.weather_code?.[i]),
    };

    if (!hourlyByDate.has(date)) {
      hourlyByDate.set(date, new Map());
    }

    hourlyByDate.get(date).set(hour, entry);
  }

  const days = dailyDates.map((dateString, index) => {
    const date = formatLocalDate(new Date(dateString));
    const hourlyMap = hourlyByDate.get(date) ?? new Map();
    const marineDailyIndex = marineDailyByDate.get(date);
    const marineDailyValue = (key, decimalPlaces = 0) =>
      marineDailyIndex == null
        ? null
        : round(marineDaily[key]?.[marineDailyIndex], decimalPlaces);
    const dailyHours = Array.from({ length: 24 }, (_, hourIndex) => {
      const hourKey = hourIndex.toString().padStart(2, "0");
      return hourlyMap.get(hourKey) ?? {
        time: `${hourKey}:00`,
        temperature: null,
        feelsLike: null,
        humidity: null,
        dewPoint: null,
        pressure: null,
        cloudCover: null,
        cloudCoverLow: null,
        cloudCoverMid: null,
        cloudCoverHigh: null,
        cloudBase: null,
        visibility: null,
        rainChance: null,
        rainVolume: null,
        windSpeed: null,
        windGust: null,
        windDirection: null,
        uvIndex: null,
        seaSurfaceTemperature: null,
        waveHeight: null,
        waveDirection: null,
        wavePeriod: null,
        windWaveHeight: null,
        windWaveDirection: null,
        windWavePeriod: null,
        swellWaveHeight: null,
        swellWaveDirection: null,
        swellWavePeriod: null,
        weatherCondition: null,
      };
    });
    const tempMin = round(weatherDaily.temperature_2m_min?.[index]);
    const tempMax = round(weatherDaily.temperature_2m_max?.[index]);
    const feelsLikeMin = round(
      weatherDaily.apparent_temperature_min?.[index],
    );
    const feelsLikeMax = round(
      weatherDaily.apparent_temperature_max?.[index],
    );
    const rainVolume = roundNonNegative(
      weatherDaily.precipitation_sum?.[index],
      1,
    );
    const rainChance = round(
      weatherDaily.precipitation_probability_max?.[index],
    );
    const windMax = round(weatherDaily.wind_speed_10m_max?.[index]);
    const windGustMax = round(weatherDaily.wind_gusts_10m_max?.[index]);
    const windDirection = getWindDirectionLabel(
      weatherDaily.wind_direction_10m_dominant?.[index],
    );
    const uvPeak = round(weatherDaily.uv_index_max?.[index]);
    const cloudValues = dailyHours
      .map((hour) => hour.cloudCover)
      .filter((v) => v != null);
    const cloudCover = cloudValues.length
      ? Math.round(
        cloudValues.reduce((sum, value) => sum + value, 0) /
        cloudValues.length,
      )
      : null;
    const summary = getWeatherLabel(weatherDaily.weather_code?.[index]);
    const pressureRange = getHourlyMetricRange(dailyHours, "pressure");
    const humidityRange = getHourlyMetricRange(dailyHours, "humidity");
    const dewPointRange = getHourlyMetricRange(dailyHours, "dewPoint", 1);
    const cloudCoverLowBaseline = getHourlyMetricAverage(dailyHours, "cloudCoverLow");
    const cloudCoverMidBaseline = getHourlyMetricAverage(dailyHours, "cloudCoverMid");
    const cloudCoverHighBaseline = getHourlyMetricAverage(dailyHours, "cloudCoverHigh");

    return {
      date,
      summary,
      tempRange:
        tempMin != null && tempMax != null ? [tempMin, tempMax] : [null, null],
      feelsLikeRange:
        feelsLikeMin != null && feelsLikeMax != null
          ? [feelsLikeMin, feelsLikeMax]
          : [null, null],
      windRange:
        windMax != null ? [Math.max(0, windMax - 6), windMax] : [null, null],
      windBaseline:
        windMax != null
          ? `${windMax} km/h ${windDirection ?? ""}`.trim()
          : null,
      windGustMax,
      rainChance,
      rainVolume,
      cloudCover,
      cloudBaseline: cloudCover,
      cloudRange: getHourlyMetricRange(dailyHours, "cloudCover"),
      cloudCoverLowBaseline,
      cloudCoverLowRange: getHourlyMetricRange(dailyHours, "cloudCoverLow"),
      cloudCoverMidBaseline,
      cloudCoverMidRange: getHourlyMetricRange(dailyHours, "cloudCoverMid"),
      cloudCoverHighBaseline,
      cloudCoverHighRange: getHourlyMetricRange(dailyHours, "cloudCoverHigh"),
      cloudBaseRange: getHourlyMetricRange(dailyHours, "cloudBase"),
      visibilityRange: getHourlyMetricRange(dailyHours, "visibility", 2),
      humidityRange,
      humidityBaseline: getHourlyMetricAverage(dailyHours, "humidity"),
      dewPointRange,
      dewPointBaseline: getHourlyMetricAverage(dailyHours, "dewPoint", 1),
      uvPeak,
      pressureRange,
      pressureBaseline: round(weatherDaily.surface_pressure_mean?.[index]) ?? getHourlyMetricAverage(dailyHours, "pressure"),
      seaSurfaceTemperatureRange: getHourlyMetricRange(dailyHours, "seaSurfaceTemperature", 1),
      seaSurfaceTemperatureBaseline: getHourlyMetricAverage(dailyHours, "seaSurfaceTemperature", 1),
      waveHeightRange: getHourlyMetricRange(dailyHours, "waveHeight", 1),
      waveHeightMax: marineDailyValue("wave_height_max", 1),
      waveDirection: getMostCommonHourlyValue(dailyHours, "waveDirection"),
      waveDirectionDominant: getWindDirectionLabel(
        marineDailyValue("wave_direction_dominant"),
      ),
      wavePeriodRange: getHourlyMetricRange(dailyHours, "wavePeriod", 1),
      wavePeriodMax: marineDailyValue("wave_period_max", 1),
      windWaveHeightRange: getHourlyMetricRange(dailyHours, "windWaveHeight", 1),
      windWaveHeightMax: marineDailyValue("wind_wave_height_max", 1),
      windWaveDirection: getMostCommonHourlyValue(dailyHours, "windWaveDirection"),
      windWaveDirectionDominant: getWindDirectionLabel(
        marineDailyValue("wind_wave_direction_dominant"),
      ),
      windWavePeriodRange: getHourlyMetricRange(dailyHours, "windWavePeriod", 1),
      windWavePeriodMax: marineDailyValue("wind_wave_period_max", 1),
      swellWaveHeightRange: getHourlyMetricRange(dailyHours, "swellWaveHeight", 1),
      swellWaveHeightMax: marineDailyValue("swell_wave_height_max", 1),
      swellWaveDirection: getMostCommonHourlyValue(dailyHours, "swellWaveDirection"),
      swellWaveDirectionDominant: getWindDirectionLabel(
        marineDailyValue("swell_wave_direction_dominant"),
      ),
      swellWavePeriodRange: getHourlyMetricRange(dailyHours, "swellWavePeriod", 1),
      swellWavePeriodMax: marineDailyValue("swell_wave_period_max", 1),
      hours: dailyHours,
    };
  });

  return { days };
}
