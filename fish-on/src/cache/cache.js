// src/cache/cache.js
import fs from "fs";
import path from "path";

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

// Merge records by unique date
export function mergeByDate(existing, incoming) {
  const merged = [...existing, ...incoming];
  const unique = Array.from(new Map(merged.map(r => [r.date, r])).values());
  unique.sort((a, b) => new Date(a.date) - new Date(b.date));
  return unique;
}
