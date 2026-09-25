// src/utils/dateUtils.js

import { DISPLAY_DAYS, TIME_ZONE } from "../config/constants.js";

export function getBuildDates(days = DISPLAY_DAYS) {
  const [year, month, day] = formatLocalDate(new Date())
    .split("-")
    .map(Number);

  // Anchor each date at UTC noon to avoid DST/timezone rollover shifting the calendar day
  return Array.from(
    { length: days },
    (_, i) => {
      return new Date(Date.UTC(year, month - 1, day + i, 12));
    }
  );
}

export function getBuildDateKeys(days = DISPLAY_DAYS) {
  return getBuildDates(days).map(formatLocalDate);
}

export function formatLocalDate(date) {
  return date.toLocaleDateString("en-CA", {
    timeZone: TIME_ZONE
  });
}

export function formatDisplayDate(date) {
  if (typeof date === "string") {
    const [year, month, day] = date.split("-").map(Number);
    date = new Date(Date.UTC(year, month - 1, day, 12));
  }

  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE
  });
}

export function formatLocalTime(date) {
  if (!date) return null;

  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE
  });
}