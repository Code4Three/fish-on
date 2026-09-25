import fs from "fs";
import path from "path";
import { DISPLAY_DAYS, LOCATION, TIME_ZONE } from "../config/constants.js";
import { formatLocalDate } from "../utils/dateUtils.js";

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

function round(value) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value);
}

function roundMillimeters(value) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value * 10) / 10;
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
        "pressure_msl",
        "cloud_cover",
        "precipitation_probability",
        "precipitation",
        "wind_speed_10m",
        "wind_direction_10m",
        "weather_code",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_direction_10m_dominant",
      ].join(","),
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetchWeatherWithRetry(url);

    const weather = await response.json();
    return processWeatherResponse(weather);
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

function processWeatherResponse(weather) {
  const hourlyByDate = new Map();

  for (let i = 0; i < (weather.hourly?.time ?? []).length; i += 1) {
    const isoTime = weather.hourly.time[i];
    // Open-Meteo returns hourly timestamps in the requested local timezone.
    const [date, localTime] = isoTime.split("T");
    const hour = localTime.slice(0, 2);
    const entry = {
      time: `${hour}:00`,
      temperature: round(weather.hourly.temperature_2m?.[i]),
      pressure: round(weather.hourly.pressure_msl?.[i]),
      cloudCover: round(weather.hourly.cloud_cover?.[i]),
      rainChance: round(weather.hourly.precipitation_probability?.[i]),
      rainVolume: roundMillimeters(weather.hourly.precipitation?.[i]),
      windSpeed: round(weather.hourly.wind_speed_10m?.[i]),
      windDirection: getWindDirectionLabel(
        weather.hourly.wind_direction_10m?.[i],
      ),
      weatherCondition: getWeatherLabel(weather.hourly.weather_code?.[i]),
    };

    if (!hourlyByDate.has(date)) {
      hourlyByDate.set(date, new Map());
    }

    hourlyByDate.get(date).set(hour, entry);
  }

  const days = (weather.daily?.time ?? []).map((dateString, index) => {
    const date = formatLocalDate(new Date(dateString));
    const hourlyMap = hourlyByDate.get(date) ?? new Map();
    const dailyHours = Array.from({ length: 24 }, (_, hourIndex) => {
      const hourKey = hourIndex.toString().padStart(2, "0");
      const exactHour = hourlyMap.get(hourKey);
      if (exactHour) return exactHour;

      const candidateHours = Array.from(hourlyMap.keys())
        .map(Number)
        .sort((a, b) => a - b);
      const closest = candidateHours.reduce((best, candidate) => {
        const currentDistance = Math.abs(candidate - hourIndex);
        const bestDistance =
          best == null ? Number.POSITIVE_INFINITY : Math.abs(best - hourIndex);
        return currentDistance < bestDistance ? candidate : best;
      }, null);

      return closest == null
        ? null
        : hourlyMap.get(String(closest).padStart(2, "0"));
    }).filter(Boolean);
    const tempMin = round(weather.daily.temperature_2m_min?.[index]);
    const tempMax = round(weather.daily.temperature_2m_max?.[index]);
    const rainVolume = roundMillimeters(
      weather.daily.precipitation_sum?.[index],
    );
    const rainChance = round(
      weather.daily.precipitation_probability_max?.[index],
    );
    const windMax = round(weather.daily.wind_speed_10m_max?.[index]);
    const windDirection = getWindDirectionLabel(
      weather.daily.wind_direction_10m_dominant?.[index],
    );
    const pressureValues = dailyHours
      .map((hour) => hour.pressure)
      .filter((v) => v != null);
    const pressureMin = pressureValues.length
      ? Math.min(...pressureValues)
      : null;
    const pressureMax = pressureValues.length
      ? Math.max(...pressureValues)
      : null;
    const cloudValues = dailyHours
      .map((hour) => hour.cloudCover)
      .filter((v) => v != null);
    const cloudCover = cloudValues.length
      ? Math.round(
          cloudValues.reduce((sum, value) => sum + value, 0) /
            cloudValues.length,
        )
      : null;
    const summary = getWeatherLabel(weather.daily.weather_code?.[index]);

    return {
      date,
      summary,
      tempRange:
        tempMin != null && tempMax != null ? [tempMin, tempMax] : [null, null],
      windRange:
        windMax != null ? [Math.max(0, windMax - 6), windMax] : [null, null],
      windBaseline:
        windMax != null
          ? `${windMax} km/h ${windDirection ?? ""}`.trim()
          : null,
      rainChance,
      rainVolume,
      cloudCover,
      cloudBaseline: cloudCover,
      pressureRange:
        pressureMin != null && pressureMax != null
          ? [pressureMin, pressureMax]
          : [null, null],
      hours: dailyHours,
    };
  });

  return { days };
}
