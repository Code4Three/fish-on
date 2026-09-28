import process from "node:process";
import { URL, URLSearchParams } from "node:url";

const MAX_TIDE_DAYS = 14;

function parseTideRequest(request) {
  const requestUrl = new URL(request.url, "https://fish-on.invalid");
  const latitude = Number(requestUrl.searchParams.get("lat"));
  const longitude = Number(requestUrl.searchParams.get("lon"));
  const days = Number(requestUrl.searchParams.get("days") ?? MAX_TIDE_DAYS);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > MAX_TIDE_DAYS
  ) {
    return null;
  }

  return { latitude, longitude, days };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.WORLDTIDES_KEY;
  if (!apiKey) {
    response.status(503).json({ error: "Tide data is not configured" });
    return;
  }

  const tideRequest = parseTideRequest(request);
  if (!tideRequest) {
    response.status(400).json({ error: "Invalid tide request parameters" });
    return;
  }

  const parameters = new URLSearchParams({
    lat: String(tideRequest.latitude),
    lon: String(tideRequest.longitude),
    days: String(tideRequest.days),
    extremes: "",
    key: apiKey,
  });

  try {
    const tideResponse = await globalThis.fetch(
      `https://www.worldtides.info/api/v3?${parameters.toString()}`,
    );
    if (!tideResponse.ok) {
      response.status(502).json({ error: "WorldTides request failed" });
      return;
    }

    const tideData = await tideResponse.json();
    if (!Array.isArray(tideData?.extremes)) {
      response.status(502).json({ error: "WorldTides response is malformed" });
      return;
    }

    response.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=3600",
    );
    response.status(200).json({ extremes: tideData.extremes });
  } catch {
    response.status(502).json({ error: "Unable to retrieve tide data" });
  }
}