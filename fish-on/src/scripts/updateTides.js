// test-tides.js
import { updateTideCache } from "../cache/tideCache.js";

(async () => {
  const lat = -26.681;
  const lon = 153.119;

  const cache = await updateTideCache(lat, lon);
  console.log("Cache updated. Total records:", cache.records.length);
})();
