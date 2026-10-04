import runtimeData from "./runtimeData.json";

if (
  !runtimeData ||
  runtimeData.schemaVersion !== 1 ||
  !Number.isInteger(runtimeData.dataVersion) ||
  !runtimeData.locations ||
  typeof runtimeData.locations !== "object"
) {
  throw new Error("Bundled runtime data has an invalid schema");
}

export const STATIC_RUNTIME_DATA_VERSION = runtimeData.dataVersion;

export function getStaticRuntimeLocationKey(location) {
  return [
    String(Number(location.lat)),
    String(Number(location.lon)),
    location.timezone,
  ].join("|");
}

export const STATIC_RUNTIME_DATA = runtimeData;

export function getStaticRuntimeLocation(location) {
  const locationKey = getStaticRuntimeLocationKey(location);
  const staticLocation = STATIC_RUNTIME_DATA.locations[locationKey] ?? null;
  if (
    staticLocation &&
    (!staticLocation.location ||
      !Array.isArray(staticLocation.tides) ||
      !Array.isArray(staticLocation.astronomy) ||
      !Array.isArray(staticLocation.solunar) ||
      !Array.isArray(staticLocation.weather))
  ) {
    throw new Error(`Bundled runtime data is invalid for ${locationKey}`);
  }
  return staticLocation;
}
