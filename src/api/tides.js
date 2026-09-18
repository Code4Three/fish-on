// src/api/tides.js
import { TIDE_CACHE_DAYS } from "../config/constants.js";

export async function fetchBulkTideData(
  lat,
  lon,
  days = TIDE_CACHE_DAYS
) {
  // HARD BLOCK: Prevent ALL browser/Vite/React/HMR calls
  if (typeof window !== "undefined") {
    console.log("BROWSER CALL BLOCKED — preventing credit burn.");
    return { extremes: [], nextHigh: null, nextLow: null };
  }

  const apiKey = process.env.WORLDTIDES_KEY;

  // Prevent accidental credit burn if key missing
  if (!apiKey) {
    throw new Error("WorldTides API key missing — refusing to burn credits.");
  }

  // Log call origin for debugging
  console.log("FETCH CALLED FROM:", "Node");

  const API_URL = `https://www.worldtides.info/api/v3?lat=${lat}&lon=${lon}&extremes&days=${days}&key=${apiKey}`;

  console.log("Calling WorldTides API");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const extremes = data?.extremes || [];

    if (!extremes.length) {
      return { error: true, message: "No tide data returned", extremes: [] };
    }

    // Sort by date/time
    extremes.sort((a, b) => new Date(a.date) - new Date(b.date));

    const now = new Date();

    const nextHigh = extremes.find(
      e => e.type === "High" && new Date(e.date) > now
    );
    const nextLow = extremes.find(
      e => e.type === "Low" && new Date(e.date) > now
    );

    return {
      extremes,
      nextHigh: nextHigh || null,
      nextLow: nextLow || null
    };

  } catch (error) {
    console.error("Error fetching bulk tide data:", error);
    return { error: true, message: error.message, extremes: [] };
  }
}
