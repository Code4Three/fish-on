// src/cache/tideCache.js
import path from "path";
import {
  loadCache,
  saveCache,
  daysBetween,
  mergeByDate
} from "./cache.js";

import { fetchBulkTideData } from "../api/tides.js";

const CACHE_FILE = path.resolve("tides.json");

export async function updateTideCache(lat, lon) {
  const cache = loadCache(CACHE_FILE);
  const now = new Date();

  let records = cache.records || [];

  // If empty → fetch 14 days
  if (records.length === 0) {
    console.log("Cache empty → fetching initial 14 days...");
    const data = await fetchBulkTideData(lat, lon, 14);
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

  // If <7 days ahead → fetch 7 more days
  if (daysAhead < 7) {
    console.log("Fetching 7 more days...");
    const newData = await fetchBulkTideData(lat, lon, 7);
    cache.records = mergeByDate(records, newData.extremes);
    saveCache(CACHE_FILE, cache);
  } else {
    console.log("Cache still valid → no API call.");
  }

  return cache;
}
