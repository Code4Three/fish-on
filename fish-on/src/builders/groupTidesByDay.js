// src/builders/groupTidesByDay.js

export function groupTidesByDay(records) {
  const days = {};

  records.forEach(rec => {
    // --- FORCE UTC → AEST (UTC+10) ---
    const utc = new Date(rec.date);
    const local = new Date(utc.getTime() + 10 * 60 * 60 * 1000); // add 10 hours

    // --- Extract local date (YYYY-MM-DD) ---
    const date = local.toLocaleDateString("en-CA"); // e.g., 2026-09-08

    // --- Extract local time (HH:MM) ---
    const time = local.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    // --- Ensure day exists ---
    if (!days[date]) {
      days[date] = {
        date,
        highTides: [],
        lowTides: [],
        tideEvents: []
      };
    }

    // --- Add high/low tide ---
    if (rec.type === "High") {
      days[date].highTides.push({ time, height: rec.height });
    }

    if (rec.type === "Low") {
      days[date].lowTides.push({ time, height: rec.height });
    }

    // --- Add unified tide event ---
    days[date].tideEvents.push({ time, height: rec.height });
  });

  // --- Sort tide events by time for each day ---
  const sortedDays = Object.values(days).map(day => {
    day.tideEvents.sort((a, b) => {
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

    day.highTides.sort((a, b) => {
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

    day.lowTides.sort((a, b) => {
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

    return day;
  });

  return sortedDays;
}
