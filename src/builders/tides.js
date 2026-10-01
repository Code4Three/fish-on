import fs from "fs";
import path from "path";

import { mergeByDate } from "../cache/cache.js";
import { getBuildDateKeys, formatLocalDate } from "../utils/dateUtils.js";

export async function buildTides() {
  const staticDataPath = path.join("src", "data", "tides.json");

  // Load static tide data
  if (!fs.existsSync(staticDataPath)) {
    throw new Error(
      `Static tide data not found at ${staticDataPath}. ` +
      "Run the data build first or ensure tides.json is present.",
    );
  }

  let cache;
  try {
    const staticData = JSON.parse(fs.readFileSync(staticDataPath, "utf-8"));
    cache = staticData;
    console.log("Loaded static tide data from src/data/tides.json");
  } catch (error) {
    throw new Error(`Failed to parse tide data: ${error.message}`);
  }

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

  // Height values are already in Chart Datum (LAT) from buildAll.js
  const adjustedRecords = records;

  const outputPath = path.join("src", "data", "tides.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ ...cache, records: adjustedRecords }, null, 2),
  );

  console.log("Tide data written → src/data/tides.json");
}
