// src/cache/tideCache.js
import path from "path";
import { loadCache, saveCache, mergeByDate } from "./cache.js";

import { fetchBulkTideData } from "../api/tides.js";
import { TIDE_CACHE_DAYS } from "../config/constants.js";
import { formatLocalDate, getBuildDateKeys } from "../utils/dateUtils.js";

const CACHE_FILE = path.resolve("tides.json");

export async function updateTideCache(lat, lon) {
  const cache = loadCache(CACHE_FILE);
  const displayDateKeys = getBuildDateKeys();

  let records = mergeByDate(cache.records || [], []);
  cache.records = records;

  if (records.length === 0) {
    console.log(`Cache empty → fetching initial ${TIDE_CACHE_DAYS} days...`);
    const data = await fetchBulkTideData(lat, lon, TIDE_CACHE_DAYS);
    cache.records = mergeByDate([], data.extremes);
    saveCache(CACHE_FILE, cache);
    return cache;
  }

  const coveredDates = new Set(
    records.map((record) => formatLocalDate(new Date(record.date))),
  );
  const missingDisplayDates = displayDateKeys.filter(
    (date) => !coveredDates.has(date),
  );

  if (missingDisplayDates.length > 0) {
    console.log(
      `Display coverage missing ${missingDisplayDates.length} day(s) → ` +
        `fetching ${TIDE_CACHE_DAYS} days...`,
    );
    const newData = await fetchBulkTideData(lat, lon, TIDE_CACHE_DAYS);
    cache.records = mergeByDate(records, newData.extremes);
    saveCache(CACHE_FILE, cache);
  } else {
    console.log("Cache still valid → no API call.");
    saveCache(CACHE_FILE, cache);
  }

  return cache;
}
