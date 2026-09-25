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
    const moonTimes = SunCalc.getMoonTimes(date, LOCATION.lat, LOCATION.lon);

    return {
      date: formatLocalDate(date),
      peaks: [
        buildPeak(
          "Major 1 (Moon overhead)",
          moonTransits.overhead,
          formatLocalDate(date),
        ),
        buildPeak(
          "Major 2 (Moon underfoot)",
          moonTransits.underfoot,
          formatLocalDate(date),
        ),
        buildPeak("Minor 1 (Moon rise)", moonTimes.rise, formatLocalDate(date)),
        buildPeak("Minor 2 (Moon set)", moonTimes.set, formatLocalDate(date)),
      ],
    };
  });
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
