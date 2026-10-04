import fs from "node:fs";
import path from "node:path";
import appConfig from "../config/appConfig.json" with { type: "json" };

const STATIC_RUNTIME_DATA_VERSION = 1;

const buildLocation = appConfig.locations.find(
  (location) => location.id === "mooloolaba",
);

if (!buildLocation) {
  throw new Error("Static runtime data has no configured build location");
}

const tideDataPath = path.join("src", "data", "tides.json");
const tideData = JSON.parse(fs.readFileSync(tideDataPath, "utf8"));
if (!Array.isArray(tideData.records)) {
  throw new Error("Static runtime data requires a valid tide records array");
}
const sunMoonData = JSON.parse(
  fs.readFileSync(path.join("src", "data", "sunMoon.json"), "utf8"),
);
const solunarData = JSON.parse(
  fs.readFileSync(path.join("src", "data", "solunar.json"), "utf8"),
);
const weatherData = JSON.parse(
  fs.readFileSync(path.join("src", "data", "weather.json"), "utf8"),
);

const locationKey = [
  String(Number(buildLocation.lat)),
  String(Number(buildLocation.lon)),
  buildLocation.timezone,
].join("|");

const runtimeData = {
  schemaVersion: 1,
  dataVersion: STATIC_RUNTIME_DATA_VERSION,
  generatedAt: new Date().toISOString(),
  locations: {
    [locationKey]: {
      location: buildLocation,
      tides: tideData.records,
      astronomy: sunMoonData.days ?? [],
      solunar: solunarData.days ?? [],
      weather: weatherData.days ?? [],
    },
  },
};

fs.writeFileSync(
  path.join("src", "data", "runtimeData.json"),
  `${JSON.stringify(runtimeData, null, 2)}\n`,
);

console.log("Unified runtime data written → src/data/runtimeData.json");
