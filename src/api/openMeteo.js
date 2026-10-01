const WEATHER_HOURLY_FIELDS = [
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
];

const WEATHER_CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "cloud_cover",
  "surface_pressure",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
];

const MARINE_HOURLY_FIELDS = [
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
];

const MARINE_DAILY_FIELDS = [
  "wave_height_max",
  "wave_direction_dominant",
  "wave_period_max",
  "wind_wave_height_max",
  "wind_wave_direction_dominant",
  "wind_wave_period_max",
  "swell_wave_height_max",
  "swell_wave_direction_dominant",
  "swell_wave_period_max",
];

const WEATHER_DAILY_FIELDS = [
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
];

const WEATHER_DAILY_ARCHIVE_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_sum",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
];

async function fetchJson(endpoint, parameters) {
  const url = new URL(endpoint);
  Object.entries(parameters).forEach(([key, value]) => {
    if (Array.isArray(value)) url.searchParams.set(key, value.join(","));
    else url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed (${response.status})`);
  }

  return response.json();
}

function getLocationParameters(location) {
  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lon) ||
    !location.timezone
  ) {
    throw new Error("A location with coordinates and timezone is required");
  }

  return {
    latitude: location.lat,
    longitude: location.lon,
    timezone: location.timezone,
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  };
}

export function getLocationDateKey(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function shiftDateKey(dateKey, dayOffset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shiftedDate = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return [
    shiftedDate.getUTCFullYear(),
    String(shiftedDate.getUTCMonth() + 1).padStart(2, "0"),
    String(shiftedDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export async function fetchOpenMeteoCurrent(location) {
  const parameters = {
    ...getLocationParameters(location),
    current: WEATHER_CURRENT_FIELDS,
    forecast_days: 1,
  };
  return fetchJson("https://api.open-meteo.com/v1/forecast", parameters);
}

export async function fetchOpenMeteoHistory(location, now = new Date()) {
  const today = getLocationDateKey(now, location.timezone);
  // The archive API rejects end_date values past the current UTC day, which
  // local "today" can exceed for timezones ahead of UTC.
  const utcToday = getLocationDateKey(now, "UTC");
  const archiveEndDate = today > utcToday ? utcToday : today;
  const weatherParameters = {
    ...getLocationParameters(location),
    start_date: shiftDateKey(archiveEndDate, -6),
    end_date: archiveEndDate,
    hourly: WEATHER_HOURLY_FIELDS,
    daily: WEATHER_DAILY_ARCHIVE_FIELDS,
  };
  const marineParameters = {
    ...getLocationParameters(location),
    hourly: MARINE_HOURLY_FIELDS,
    daily: MARINE_DAILY_FIELDS,
    past_days: 7,
    forecast_days: 1,
  };
  const [weather, marine] = await Promise.all([
    fetchJson("https://archive-api.open-meteo.com/v1/archive", weatherParameters),
    fetchJson("https://marine-api.open-meteo.com/v1/marine", marineParameters),
  ]);

  return { weather, marine, today };
}

export async function fetchOpenMeteoForecast(location) {
  const weatherParameters = {
    ...getLocationParameters(location),
    hourly: WEATHER_HOURLY_FIELDS,
    daily: WEATHER_DAILY_FIELDS,
    forecast_days: 7,
  };
  const marineParameters = {
    ...getLocationParameters(location),
    hourly: MARINE_HOURLY_FIELDS,
    daily: MARINE_DAILY_FIELDS,
    forecast_days: 7,
  };

  const [weather, marine] = await Promise.all([
    fetchJson("https://api.open-meteo.com/v1/forecast", weatherParameters),
    fetchJson("https://marine-api.open-meteo.com/v1/marine", marineParameters),
  ]);

  return { weather, marine };
}

export function getOpenMeteoFieldSets() {
  return {
    current: [...WEATHER_CURRENT_FIELDS],
    weatherHourly: [...WEATHER_HOURLY_FIELDS],
    weatherDaily: [...WEATHER_DAILY_FIELDS],
    marineHourly: [...MARINE_HOURLY_FIELDS],
    marineDaily: [...MARINE_DAILY_FIELDS],
  };
}