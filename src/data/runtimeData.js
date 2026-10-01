import {
  fetchOpenMeteoCurrent,
  fetchOpenMeteoForecast,
  fetchOpenMeteoHistory,
  getLocationDateKey,
} from "../api/openMeteo.js";
import {
  getRuntimeRecord,
  getRuntimeRecordsForLocation,
  putRuntimeRecord,
  replaceRuntimeLocationRecords,
} from "../cache/runtimeStore.js";
import { buildRuntimeAstronomy } from "./runtimeAstronomy.js";

const CURRENT_MAX_AGE_MS = 15 * 60 * 1000;
const HISTORY_DATA_VERSION = 2;
const FORECAST_DATA_VERSION = 2;
const inFlightRefreshes = new Map();

function refreshOnce(locationKey, slice, refresh) {
  const requestKey = `${locationKey}|${slice}`;
  const existingRequest = inFlightRefreshes.get(requestKey);
  if (existingRequest) return existingRequest;

  const request = Promise.resolve().then(refresh);
  inFlightRefreshes.set(requestKey, request);
  request.then(
    () => inFlightRefreshes.delete(requestKey),
    () => inFlightRefreshes.delete(requestKey),
  );
  return request;
}

export function getRuntimeLocationKey(location) {
  return [
    String(Number(location.lat)),
    String(Number(location.lon)),
    location.timezone,
  ].join("|");
}

function indexByTime(hourly = {}) {
  const indexed = new Map();
  const times = Array.isArray(hourly.time) ? hourly.time : [];

  times.forEach((time, index) => {
    if (typeof time === "string") indexed.set(time, index);
  });

  return indexed;
}

function valuesAt(hourly, index, fields) {
  return Object.fromEntries(
    fields.map((field) => [field, hourly?.[field]?.[index] ?? null]),
  );
}

function groupHourlyData(weather, marine, locationKey) {
  const weatherHourly = weather?.hourly ?? {};
  const marineHourly = marine?.hourly ?? {};
  const marineIndexes = indexByTime(marineHourly);
  const groups = new Map();

  (Array.isArray(weatherHourly.time) ? weatherHourly.time : []).forEach(
    (timestamp, index) => {
      if (typeof timestamp !== "string" || !timestamp.includes("T")) return;
      const [date, time] = timestamp.split("T");
      const marineIndex = marineIndexes.get(timestamp);
      const hour = {
        timestamp,
        time,
        weather: valuesAt(weatherHourly, index, Object.keys(weatherHourly).filter((key) => key !== "time")),
        marine:
          marineIndex == null
            ? null
            : valuesAt(
              marineHourly,
              marineIndex,
              Object.keys(marineHourly).filter((key) => key !== "time"),
            ),
      };

      if (!groups.has(date)) {
        groups.set(date, {
          locationKey,
          date,
          hours: [],
          daily: null,
        });
      }

      groups.get(date).hours.push(hour);
    },
  );

  const daily = weather?.daily ?? {};
  (Array.isArray(daily.time) ? daily.time : []).forEach((date, index) => {
    const record = groups.get(date) ?? { locationKey, date, hours: [] };
    record.daily = valuesAt(
      daily,
      index,
      Object.keys(daily).filter((key) => key !== "time"),
    );
    groups.set(date, record);
  });

  const marineDaily = marine?.daily ?? {};
  (Array.isArray(marineDaily.time) ? marineDaily.time : []).forEach(
    (date, index) => {
      const record = groups.get(date) ?? { locationKey, date, hours: [] };
      record.marineDaily = valuesAt(
        marineDaily,
        index,
        Object.keys(marineDaily).filter((key) => key !== "time"),
      );
      groups.set(date, record);
    },
  );

  return [...groups.values()].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
}

function isCurrentStale(refreshRecord, now) {
  const fetchedAt = Date.parse(refreshRecord?.fetchedAt ?? "");
  return !Number.isFinite(fetchedAt) || now.getTime() - fetchedAt > CURRENT_MAX_AGE_MS;
}

function isDailySliceStale(refreshRecord, today, dataVersion = 1) {
  return (
    refreshRecord?.localDate !== today ||
    refreshRecord?.dataVersion !== dataVersion
  );
}

export async function writeDevelopmentSnapshot(snapshot) {
  if (!import.meta.env.DEV) return;

  const response = await fetch("/__debug/conditions-snapshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });

  if (!response.ok) {
    throw new Error(`Debug snapshot write failed (${response.status})`);
  }
}

async function storeDailyRecords(storeName, records) {
  if (!records.length) {
    throw new Error(`Open-Meteo returned no ${storeName} records`);
  }
  const locationKey = records[0].locationKey;
  await replaceRuntimeLocationRecords(storeName, locationKey, records);
}

async function fetchTideRecords(location, locationKey) {
  const parameters = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    days: "14",
  });
  const response = await fetch(`/api/tides?${parameters.toString()}`);
  if (!response.ok) {
    throw new Error(`Tide request failed (${response.status})`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.extremes)) {
    throw new Error("Tide response is missing extremes");
  }

  return payload.extremes.flatMap((extreme) => {
    const eventDate = new Date(extreme.date);
    const height = Number(extreme.height);
    if (
      !Number.isFinite(eventDate.getTime()) ||
      !Number.isFinite(height) ||
      !["High", "Low"].includes(extreme.type)
    ) {
      return [];
    }
    // The static tide dataset is already referenced to the correct chart datum, so no further
    // offset is applied here (unlike the legacy WorldTides MSL-referenced API response).
    return [{
      locationKey,
      timestamp: eventDate.toISOString(),
      type: extreme.type,
      height,
    }];
  });
}

export async function loadRuntimeLocationData(
  location,
  now = new Date(),
  onCacheReady,
) {
  const locationKey = getRuntimeLocationKey(location);
  const today = getLocationDateKey(now, location.timezone);
  const [current, history, forecast, tides, refreshRecords] = await Promise.all([
    getRuntimeRecord("current", locationKey),
    getRuntimeRecordsForLocation("history", locationKey),
    getRuntimeRecordsForLocation("forecast", locationKey),
    getRuntimeRecordsForLocation("tides", locationKey),
    getRuntimeRecordsForLocation("refresh", locationKey),
  ]);
  const refreshBySlice = new Map(
    refreshRecords.map((record) => [record.slice, record]),
  );
  const existingAstronomy = await getRuntimeRecordsForLocation(
    "astronomy",
    locationKey,
  );
  const retainedAstronomy = existingAstronomy.filter(
    (record) =>
      record.date >= shiftDateKey(today, -6) &&
      record.date <= shiftDateKey(today, 6),
  );
  const astronomyByDate = new Map(
    retainedAstronomy.map((record) => [record.date, record]),
  );
  const astronomyRecords = [];
  for (let dayOffset = -6; dayOffset <= 6; dayOffset += 1) {
    const date = shiftDateKey(today, dayOffset);
    if (!astronomyByDate.has(date)) {
      astronomyRecords.push({
        locationKey,
        date,
        ...buildRuntimeAstronomy(date, location),
        calculatedAt: new Date().toISOString(),
      });
    }
  }
  if (
    astronomyRecords.length ||
    retainedAstronomy.length !== existingAstronomy.length
  ) {
    await replaceRuntimeLocationRecords("astronomy", locationKey, [
      ...retainedAstronomy,
      ...astronomyRecords,
    ]);
  }
  const cachedSnapshot = {
    locationKey,
    location,
    current,
    history,
    forecast,
    tides,
    astronomy: [...retainedAstronomy, ...astronomyRecords],
    errors: {},
  };
  if (typeof onCacheReady === "function") onCacheReady(cachedSnapshot);

  const errors = {};
  const refreshTasks = [];

  if (isCurrentStale(refreshBySlice.get("current"), now)) {
    refreshTasks.push(
      refreshOnce(locationKey, "current", () => fetchOpenMeteoCurrent(location))
        .then(async (payload) => {
          if (!payload?.current || typeof payload.current.time !== "string") {
            throw new Error("Open-Meteo current response is missing values");
          }
          const fetchedAt = new Date().toISOString();
          await Promise.all([
            putRuntimeRecord("current", {
              locationKey,
              locationId: location.id,
              timestamp: payload.current.time,
              fetchedAt,
              values: payload.current,
            }),
            putRuntimeRecord("refresh", {
              locationKey,
              slice: "current",
              fetchedAt,
            }),
          ]);
        })
        .catch((error) => {
          errors.current = error instanceof Error ? error.message : String(error);
        }),
    );
  }

  if (
    isDailySliceStale(
      refreshBySlice.get("history"),
      today,
      HISTORY_DATA_VERSION,
    )
  ) {
    refreshTasks.push(
      refreshOnce(locationKey, "history", () => fetchOpenMeteoHistory(location, now))
        .then(async ({ weather, marine }) => {
          const records = groupHourlyData(weather, marine, locationKey).filter(
            (record) => record.date >= shiftDateKey(today, -6) && record.date <= today,
          );
          await storeDailyRecords("history", records);
          await putRuntimeRecord("refresh", {
            locationKey,
            slice: "history",
            localDate: today,
            dataVersion: HISTORY_DATA_VERSION,
            fetchedAt: new Date().toISOString(),
          });
        })
        .catch((error) => {
          errors.history = error instanceof Error ? error.message : String(error);
        }),
    );
  }

  if (
    isDailySliceStale(
      refreshBySlice.get("forecast"),
      today,
      FORECAST_DATA_VERSION,
    )
  ) {
    refreshTasks.push(
      refreshOnce(locationKey, "forecast", () => fetchOpenMeteoForecast(location))
        .then(async ({ weather, marine }) => {
          const records = groupHourlyData(weather, marine, locationKey).filter(
            (record) => record.date >= today && record.date <= shiftDateKey(today, 6),
          );
          await storeDailyRecords("forecast", records);
          await putRuntimeRecord("refresh", {
            locationKey,
            slice: "forecast",
            localDate: today,
            dataVersion: FORECAST_DATA_VERSION,
            fetchedAt: new Date().toISOString(),
          });
        })
        .catch((error) => {
          errors.forecast = error instanceof Error ? error.message : String(error);
        }),
    );
  }

  if (isDailySliceStale(refreshBySlice.get("tides"), today)) {
    refreshTasks.push(
      refreshOnce(
        locationKey,
        "tides",
        () => location.tide === "Non-tidal"
          ? Promise.resolve([])
          : fetchTideRecords(location, locationKey),
      )
        .then(async (records) => {
          await replaceRuntimeLocationRecords("tides", locationKey, records);
          await putRuntimeRecord("refresh", {
            locationKey,
            slice: "tides",
            localDate: today,
            fetchedAt: new Date().toISOString(),
          });
        })
        .catch((error) => {
          errors.tides = error instanceof Error ? error.message : String(error);
        }),
    );
  }

  await Promise.all(refreshTasks);

  const [updatedCurrent, updatedHistory, updatedForecast, updatedTides, updatedAstronomy, updatedRefresh] =
    await Promise.all([
      getRuntimeRecord("current", locationKey),
      getRuntimeRecordsForLocation("history", locationKey),
      getRuntimeRecordsForLocation("forecast", locationKey),
      getRuntimeRecordsForLocation("tides", locationKey),
      getRuntimeRecordsForLocation("astronomy", locationKey),
      getRuntimeRecordsForLocation("refresh", locationKey),
    ]);
  const currentData = updatedCurrent ?? current;
  const historyData = updatedHistory.length ? updatedHistory : history;
  const forecastData = updatedForecast.length ? updatedForecast : forecast;

  return {
    locationKey,
    location,
    current: currentData,
    history: historyData,
    forecast: forecastData,
    tides: updatedTides.length ? updatedTides : tides,
    astronomy: updatedAstronomy,
    refresh: updatedRefresh,
    errors,
    loadedAt: new Date().toISOString(),
  };
}

function shiftDateKey(dateKey, offset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + offset));
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    String(shifted.getUTCDate()).padStart(2, "0"),
  ].join("-");
}