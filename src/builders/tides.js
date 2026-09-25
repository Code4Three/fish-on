import fs from "fs";
import path from "path";

import { mergeByDate } from "../cache/cache.js";
import { updateTideCache } from "../cache/tideCache.js";
import { LOCATION } from "../config/constants.js";
import { getBuildDateKeys, formatLocalDate } from "../utils/dateUtils.js";

export async function buildTides() {
  const cache = await updateTideCache(LOCATION.lat, LOCATION.lon);
  const buildDateKeys = getBuildDateKeys();
  const buildDateSet = new Set(buildDateKeys);
  const firstBuildDate = buildDateKeys[0];

  const normalizedRecords = mergeByDate(cache.records, []);
  const previousRecord = normalizedRecords
    .filter((record) => formatLocalDate(new Date(record.date)) < firstBuildDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const records = normalizedRecords.filter((record) =>
    buildDateSet.has(formatLocalDate(new Date(record.date))),
  );

  if (previousRecord) {
    records.unshift(previousRecord);
  }

  // WorldTides returns MSL heights; shift to Chart Datum (LAT) for the active location
  const datumOffset = LOCATION.datumOffset ?? 0;
  const adjustedRecords = records.map((record) => ({
    ...record,
    height: record.height + datumOffset,
  }));

  const outputPath = path.join("src", "data", "tides.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ ...cache, records: adjustedRecords }, null, 2),
  );

  console.log("Tide data written → src/data/tides.json");
}
