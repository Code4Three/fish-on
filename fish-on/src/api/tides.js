// src/api/tides.js
console.log("TEST SCRIPT EXECUTED");

export async function fetchBulkTideData(lat, lon, days = 7) {
  // HARD BLOCK: Prevent ALL browser/Vite/React/HMR calls
  if (typeof window !== "undefined") {
    console.log("BROWSER CALL BLOCKED — preventing credit burn.");
    return { extremes: [], nextHigh: null, nextLow: null };
  }

  // Load API key from Vite (browser) or Node (test script)
  const apiKey =
    import.meta.env?.VITE_WORLDTIDES_KEY ||
    process.env.VITE_WORLDTIDES_KEY;

  // Prevent accidental credit burn if key missing
  if (!apiKey) {
    throw new Error("WorldTides API key missing — refusing to burn credits.");
  }

  // Log call origin for debugging
  console.log("FETCH CALLED FROM:", "Node");

  const API_URL = `https://www.worldtides.info/api/v3?lat=${lat}&lon=${lon}&extremes&days=${days}&key=${apiKey}`;

  // Log the exact URL so you can track credit usage
  console.log("API CALL:", API_URL);

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
