// src/cache/cache.js
import fs from "fs";

// Ensure JSON file exists
export function ensureCacheFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ records: [] }, null, 2));
    console.log(`Created new cache file: ${filePath}`);
  }
}

// Load JSON cache
export function loadCache(filePath) {
  ensureCacheFile(filePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

// Save JSON cache
export function saveCache(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Cache saved: ${filePath}`);
}

// Days between two dates
export function daysBetween(a, b) {
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

// Merge records while replacing overlapping API predictions.
export function mergeByDate(existing, incoming) {
  const merged = [
    ...existing.map((record) => ({ record, source: 0 })),
    ...incoming.map((record) => ({ record, source: 1 })),
  ].sort((a, b) => new Date(a.record.date) - new Date(b.record.date));
  const unique = [];
  const overlapWindowMs = 2 * 60 * 60 * 1000;

  // When two records fall within the overlap window, keep the newer source (incoming beats cached)
  for (const candidate of merged) {
    const previous = unique[unique.length - 1];
    const overlaps =
      previous &&
      new Date(candidate.record.date) - new Date(previous.record.date) <=
        overlapWindowMs;

    if (overlaps) {
      if (candidate.source >= previous.source) {
        unique[unique.length - 1] = candidate;
      }
      continue;
    }

    unique.push(candidate);
  }

  return unique.map(({ record }) => record);
}
