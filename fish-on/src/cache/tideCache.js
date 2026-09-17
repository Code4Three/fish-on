// src/cache/tideCache.js
import path from "path";
import {
  loadCache,
  saveCache,
  daysBetween,
  mergeByDate
} from "./cache.js";

import { fetchBulkTideData } from "../api/tides.js";
import {
  BUILD_DAYS,
  TIDE_REFRESH_DAYS
} from "../config/constants.js";

const CACHE_FILE = path.resolve("tides.json");

export async function updateTideCache(lat, lon) {
  const cache = loadCache(CACHE_FILE);
  const now = new Date();

  let records = cache.records || [];

  if (records.length === 0) {
    console.log(`Cache empty → fetching initial ${BUILD_DAYS} days...`);
    const data = await fetchBulkTideData(lat, lon, BUILD_DAYS);
    cache.records = data.extremes;
    saveCache(CACHE_FILE, cache);
    return cache;
  }

  // Determine future coverage
  const future = records.filter(r => new Date(r.date) > now);
  const lastFuture = future.length
    ? new Date(future[future.length - 1].date)
    : new Date(0);

  const daysAhead = daysBetween(now, lastFuture);
  console.log(`Future coverage: ${daysAhead} days`);

  if (daysAhead < TIDE_REFRESH_DAYS) {
    console.log(`Fetching ${TIDE_REFRESH_DAYS} more days...`);
    const newData = await fetchBulkTideData(lat, lon, TIDE_REFRESH_DAYS);
    cache.records = mergeByDate(records, newData.extremes);
    saveCache(CACHE_FILE, cache);
  } else {
    console.log("Cache still valid → no API call.");
  }

  return cache;
}
