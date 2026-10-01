import * as SunCalc from "suncalc";

import {
  LOCATION,
  SOLUNAR_MAJOR_WINDOW_MINUTES,
  SOLUNAR_MINOR_WINDOW_MINUTES,
} from "../config/constants.js";
import {
  formatLocalDate,
  formatLocalTime,
  getBuildDates,
} from "../utils/dateUtils.js";

const SAMPLE_INTERVAL_MS = 60 * 60 * 1000;

export function buildSolunarDays() {
  // Two "major" peaks (moon overhead/underfoot) and two "minor" peaks (moonrise/moonset) per day
  return getBuildDates().map((date) => {
    const moonTransits = findMoonTransits(date);
    const localDateStr = formatLocalDate(date);

    // Get moonrise/moonset for this local date.
    // SunCalc.getMoonTimes() expects a UTC date. For timezone-aware locations,
    // we need to ensure the date passed to SunCalc corresponds to the local calendar day.
    // Brisbane is UTC+10, so local date Oct 2 spans UTC Oct 1 14:00 - Oct 2 14:00.
    // Use a time within that range (UTC Oct 1 20:00 - Oct 2 12:00) to ensure accuracy.
    const moonTimes = getMoonTimesForLocalDate(localDateStr);

    return {
      date: localDateStr,
      peaks: [
        buildPeak(
          "Major 1 (Moon overhead)",
          moonTransits.overhead,
          localDateStr,
        ),
        buildPeak(
          "Major 2 (Moon underfoot)",
          moonTransits.underfoot,
          localDateStr,
        ),
        buildPeak("Minor 1 (Moon rise)", moonTimes.rise, localDateStr),
        buildPeak("Minor 2 (Moon set)", moonTimes.set, localDateStr),
      ],
    };
  });
}

/**
 * Get moonrise/moonset times for a specific local calendar date.
 * Handles timezone offsets by checking multiple adjacent UTC days to ensure
 * we capture horizon crossings that occur on the local date.
 */
function getMoonTimesForLocalDate(localDateStr) {
  const [year, month, day] = localDateStr.split("-").map(Number);

  // Check a range of UTC dates that might contain events for this local date
  // Brisbane is UTC+10, so local date Oct 2 (00:00-23:59) corresponds to:
  // - UTC Oct 1 14:00 to UTC Oct 2 14:00
  // We'll check UTC dates Oct 1, Oct 2, and Oct 3 to be safe
  const candidateDates = [
    new Date(Date.UTC(year, month - 1, day - 1, 20)), // UTC day before, 8 PM
    new Date(Date.UTC(year, month - 1, day, 12)),     // UTC this day, noon
    new Date(Date.UTC(year, month - 1, day + 1, 4)),  // UTC day after, 4 AM
  ];

  let moonTimes = { rise: null, set: null };

  // Check each candidate date and collect any events that occur in local time on the target date
  for (const candidateDate of candidateDates) {
    const times = SunCalc.getMoonTimes(candidateDate, LOCATION.lat, LOCATION.lon);

    // Check if rise/set times fall within the local date
    if (times.rise && formatLocalDate(times.rise) === localDateStr && !moonTimes.rise) {
      moonTimes.rise = times.rise;
    }
    if (times.set && formatLocalDate(times.set) === localDateStr && !moonTimes.set) {
      moonTimes.set = times.set;
    }
  }

  return moonTimes;
}

function buildPeak(type, eventDate, targetDate) {
  if (!eventDate) {
    return {
      type,
      time: null,
      start: null,
      end: null,
    };
  }

  const windowMinutes = type.startsWith("Major")
    ? SOLUNAR_MAJOR_WINDOW_MINUTES
    : SOLUNAR_MINOR_WINDOW_MINUTES;
  const eventTime = formatLocalTime(eventDate);
  const [hour, minute] = eventTime.split(":").map(Number);

  return {
    type,
    time: eventTime,
    start: formatLocalPoint(targetDate, hour * 60 + minute - windowMinutes),
    end: formatLocalPoint(targetDate, hour * 60 + minute + windowMinutes),
  };
}

function formatLocalPoint(dateKey, minutes) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, minutes));

  return {
    date: [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-"),
    time: [
      String(date.getUTCHours()).padStart(2, "0"),
      String(date.getUTCMinutes()).padStart(2, "0"),
    ].join(":"),
  };
}

function findMoonTransits(date) {
  const targetDate = formatLocalDate(date);
  const start = new Date(date.getTime() - 24 * 60 * 60 * 1000);

  const samples = [];

  // Sample moon altitude hourly across a 48h window to find the true peak/trough for this day
  for (
    let offset = 0;
    offset <= 48 * 60 * 60 * 1000;
    offset += SAMPLE_INTERVAL_MS
  ) {
    const sampleDate = new Date(start.getTime() + offset);
    if (formatLocalDate(sampleDate) !== targetDate) continue;

    const position = SunCalc.getMoonPosition(
      sampleDate,
      LOCATION.lat,
      LOCATION.lon,
    );

    samples.push({ date: sampleDate, altitude: position.altitude });
  }

  let overhead = samples[0];
  let underfoot = samples[0];

  for (const sample of samples) {
    if (sample.altitude > overhead.altitude) overhead = sample;
    if (sample.altitude < underfoot.altitude) underfoot = sample;
  }

  return {
    overhead: refineMoonTransit(samples, overhead, "max"),
    underfoot: refineMoonTransit(samples, underfoot, "min"),
  };
}

function refineMoonTransit(samples, extreme, direction) {
  const index = samples.indexOf(extreme);

  if (index <= 0 || index >= samples.length - 1) {
    return extreme.date;
  }

  let left = samples[index - 1].date.getTime();
  let right = samples[index + 1].date.getTime();

  for (let iteration = 0; iteration < 20; iteration++) {
    const first = left + (right - left) / 3;
    const second = right - (right - left) / 3;
    const firstAltitude = getMoonAltitude(new Date(first));
    const secondAltitude = getMoonAltitude(new Date(second));

    if (direction === "max") {
      if (firstAltitude < secondAltitude) left = first;
      else right = second;
    } else if (firstAltitude > secondAltitude) {
      left = first;
    } else {
      right = second;
    }
  }

  return new Date((left + right) / 2);
}

function getMoonAltitude(date) {
  return SunCalc.getMoonPosition(date, LOCATION.lat, LOCATION.lon).altitude;
}
