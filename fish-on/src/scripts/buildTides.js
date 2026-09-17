import fs from "fs";
import path from "path";

import { updateTideCache } from "../cache/tideCache.js";
import { LOCATION } from "../config/constants.js";
import { getBuildDateKeys, formatLocalDate } from "../utils/dateUtils.js";

const cache = await updateTideCache(LOCATION.lat, LOCATION.lon);
const buildDateKeys = new Set(getBuildDateKeys());
const records = cache.records.filter(record =>
	buildDateKeys.has(formatLocalDate(new Date(record.date)))
);
const outputPath = path.join("src", "data", "tides.json");

fs.writeFileSync(
	outputPath,
	JSON.stringify({ ...cache, records }, null, 2)
);

console.log("Tide data written → src/data/tides.json");