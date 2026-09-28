import * as SunCalc from "suncalc";
import { getLocationDateKey, shiftDateKey } from "../api/openMeteo.js";

const HOUR_MS = 60 * 60 * 1000;
const SOLUNAR_MAJOR_WINDOW_MINUTES = 60;
const SOLUNAR_MINOR_WINDOW_MINUTES = 30;

export function getZonedInstant(dateKey, hour, minute, timezone) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = desiredUtc;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(candidate));
    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, Number(value)]),
    );
    const representedUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    );
    candidate += desiredUtc - representedUtc;
  }

  return new Date(candidate);
}

export function formatLocalTime(date, timezone) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function getUtcDate(dateKey, dayOffset) {
  return new Date(`${shiftDateKey(dateKey, dayOffset)}T12:00:00Z`);
}

function findLocalAstronomyEvent(dateKey, location, eventName, eventSource) {
  for (let offset = -2; offset <= 2; offset += 1) {
    const events = eventSource(
      getUtcDate(dateKey, offset),
      location.lat,
      location.lon,
    );
    const event = events[eventName];
    if (event && getLocationDateKey(event, location.timezone) === dateKey) {
      return event;
    }
  }
  return null;
}

function getMoonPhaseName(phase) {
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

function getMoonAltitude(date, location) {
  return SunCalc.getMoonPosition(date, location.lat, location.lon).altitude;
}

function refineTransit(samples, extreme, direction, location) {
  const extremeIndex = samples.indexOf(extreme);
  if (extremeIndex <= 0 || extremeIndex >= samples.length - 1) {
    return extreme.date;
  }

  let left = samples[extremeIndex - 1].date.getTime();
  let right = samples[extremeIndex + 1].date.getTime();
  for (let iteration = 0; iteration < 20; iteration += 1) {
    const first = left + (right - left) / 3;
    const second = right - (right - left) / 3;
    const firstAltitude = getMoonAltitude(new Date(first), location);
    const secondAltitude = getMoonAltitude(new Date(second), location);

    if (direction === "max" ? firstAltitude < secondAltitude : firstAltitude > secondAltitude) {
      left = first;
    } else {
      right = second;
    }
  }
  return new Date((left + right) / 2);
}

function findMoonTransits(dateKey, location) {
  const start = getZonedInstant(dateKey, 0, 0, location.timezone);
  const end = getZonedInstant(shiftDateKey(dateKey, 1), 0, 0, location.timezone);
  const samples = [];

  for (let timestamp = start.getTime(); timestamp < end.getTime(); timestamp += HOUR_MS) {
    const date = new Date(timestamp);
    samples.push({ date, altitude: getMoonAltitude(date, location) });
  }
  samples.push({ date: end, altitude: getMoonAltitude(end, location) });

  const overhead = samples.reduce((highest, sample) =>
    sample.altitude > highest.altitude ? sample : highest,
  );
  const underfoot = samples.reduce((lowest, sample) =>
    sample.altitude < lowest.altitude ? sample : lowest,
  );

  return {
    overhead: refineTransit(samples, overhead, "max", location),
    underfoot: refineTransit(samples, underfoot, "min", location),
  };
}

function makePeak(type, event, dateKey, windowMinutes, timezone) {
  if (!event) return { type, time: null, start: null, end: null };

  const windowMs = windowMinutes * 60 * 1000;
  const start = new Date(event.getTime() - windowMs);
  const end = new Date(event.getTime() + windowMs);
  const formatPoint = (date) => ({
    date: getLocationDateKey(date, timezone),
    time: formatLocalTime(date, timezone),
  });

  return {
    type,
    time: formatLocalTime(event, timezone),
    start: formatPoint(start),
    end: formatPoint(end),
  };
}

export function buildRuntimeAstronomy(dateKey, location) {
  const lat = location.lat;
  const lon = location.lon;
  const timezone = location.timezone;
  const localNoon = getZonedInstant(dateKey, 12, 0, timezone);
  const sunTimes = {
    sunrise: findLocalAstronomyEvent(dateKey, location, "sunrise", SunCalc.getTimes),
    sunset: findLocalAstronomyEvent(dateKey, location, "sunset", SunCalc.getTimes),
    firstLight: findLocalAstronomyEvent(dateKey, location, "dawn", SunCalc.getTimes),
    lastLight: findLocalAstronomyEvent(dateKey, location, "dusk", SunCalc.getTimes),
  };
  const moonrise = findLocalAstronomyEvent(dateKey, location, "rise", SunCalc.getMoonTimes);
  const moonset = findLocalAstronomyEvent(dateKey, location, "set", SunCalc.getMoonTimes);
  const illumination = SunCalc.getMoonIllumination(localNoon);
  const moonPosition = SunCalc.getMoonPosition(localNoon, lat, lon);
  const transits = findMoonTransits(dateKey, location);

  return {
    sunrise: formatLocalTime(sunTimes.sunrise, timezone),
    sunset: formatLocalTime(sunTimes.sunset, timezone),
    firstLight: formatLocalTime(sunTimes.firstLight, timezone),
    lastLight: formatLocalTime(sunTimes.lastLight, timezone),
    moonrise: formatLocalTime(moonrise, timezone),
    moonset: formatLocalTime(moonset, timezone),
    moonPhase: getMoonPhaseName(illumination.phase),
    illumination: Math.round(illumination.fraction * 100),
    moonDistance: Math.round(moonPosition.distance),
    solunarPeaks: [
      makePeak("Major 1 (Moon overhead)", transits.overhead, dateKey, SOLUNAR_MAJOR_WINDOW_MINUTES, timezone),
      makePeak("Major 2 (Moon underfoot)", transits.underfoot, dateKey, SOLUNAR_MAJOR_WINDOW_MINUTES, timezone),
      makePeak("Minor 1 (Moon rise)", moonrise, dateKey, SOLUNAR_MINOR_WINDOW_MINUTES, timezone),
      makePeak("Minor 2 (Moon set)", moonset, dateKey, SOLUNAR_MINOR_WINDOW_MINUTES, timezone),
    ],
  };
}