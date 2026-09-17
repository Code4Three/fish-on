// src/builders/unifiedConditions.js

import fs from "fs";
import path from "path";
import { groupTidesByDay } from "./groupTidesByDay.js";
import { classifyTideStage } from "./tideStageClassifier.js";
import { getBuildDateKeys } from "../utils/dateUtils.js";

export function buildUnifiedConditions() {
  const tidesPath = path.join("src", "data", "tides.json");
  const tides = JSON.parse(fs.readFileSync(tidesPath, "utf8"));
  const sunMoonPath = path.join(
    "src",
    "data",
    "sunMoon.json"
  );

  const sunMoon = JSON.parse(
    fs.readFileSync(sunMoonPath, "utf8")
  );

  const groupedTides = groupTidesByDay(tides.records);
  const tideDays = new Map(groupedTides.map(day => [day.date, day]));
  const days = getBuildDateKeys().map(date => tideDays.get(date) ?? {
    date,
    highTides: [],
    lowTides: [],
    tideEvents: []
  });

  const unified = {
    days: days.map((day, index) => {
      const prevDay = days[index - 1];
      const nextDay = days[index + 1];

      // Build combined tide events for interpolation
      const combinedEvents = [
        ...(prevDay?.tideEvents.slice(-1).map(ev => ({ ...ev, isPrevDay: true })) ?? []),
        ...day.tideEvents.map(ev => ({ ...ev, isCurrentDay: true })),
        ...(nextDay?.tideEvents.slice(0, 1).map(ev => ({ ...ev, isNextDay: true })) ?? [])
      ];

      const sunMoonDay =
        sunMoon.days.find(
          d => d.date === day.date
        );

      return {
        date: day.date,
        anchored: buildAnchored(
          day,
          sunMoonDay
        ),
        hours: buildHourly(day, combinedEvents)
      };
    })
  };

  const outputPath = path.join("public", "conditions.json");
  fs.writeFileSync(outputPath, JSON.stringify(unified, null, 2));

  console.log("Unified conditions written → public/conditions.json");
}

function buildAnchored(day, sunMoonDay) {
  return {
    highTides: day.highTides,
    lowTides: day.lowTides,

    sunrise: sunMoonDay?.sunrise ?? null,
    sunset: sunMoonDay?.sunset ?? null,

    moonrise: sunMoonDay?.moonrise ?? null,
    moonset: sunMoonDay?.moonset ?? null,

    moonPhase: sunMoonDay?.moonPhase ?? null,
    illumination: sunMoonDay?.illumination ?? null,

    weatherSummary: null,
    tempRange: [null, null],
    windBaseline: null,
    cloudBaseline: null,
    pressureRange: [null, null],

    dayScore: null
  };
}

function interpolateHeight(tideEvents, hourStr) {
  const [h, m] = hourStr.split(":").map(Number);
  const targetMinutes = h * 60 + m;

  const events = tideEvents.map(ev => {
    const [eh, em] = ev.time.split(":").map(Number);
    let minutes = eh * 60 + em;

    if (ev.isPrevDay) {
      minutes -= 24 * 60;   // shift previous day into negative time
    }

    if (ev.isNextDay) {
      minutes += 24 * 60;   // shift next day into >1440 minutes
    }

    return { minutes, height: ev.height };
  });

  let before = null;
  let after = null;

  for (let ev of events) {
    if (ev.minutes <= targetMinutes) before = ev;
    if (ev.minutes > targetMinutes && !after) after = ev;
  }

  if (!before || !after) return null;

  const ratio = (targetMinutes - before.minutes) / (after.minutes - before.minutes);
  return before.height + ratio * (after.height - before.height);
}

function findBoundingTides(hourStr, tideEvents) {
  const [h, m] = hourStr.split(":").map(Number);
  const targetMinutes = h * 60 + m;

  const events = tideEvents.map(event => {
    const [eh, em] = event.time.split(":").map(Number);

    let minutes = eh * 60 + em;

    if (event.isPrevDay) {
      minutes -= 24 * 60;
    }

    if (event.isNextDay) {
      minutes += 24 * 60;
    }

    return {
      ...event,
      minutes
    };
  });

  let previous = null;
  let next = null;

  for (const event of events) {
    if (event.minutes <= targetMinutes) {
      previous = event;
    }

    if (event.minutes > targetMinutes && !next) {
      next = event;
    }
  }

  if (!previous || !next) {
    return null;
  }

  const progress =
    (targetMinutes - previous.minutes) /
    (next.minutes - previous.minutes);

  const direction =
    previous.type === "Low" &&
    next.type === "High"
      ? "incoming"
      : "outgoing";

  return {
    start: previous,
    end: next,
    direction,
    progress
  };
}

function buildHourly(day, tideEvents) {
  const hours = [];

  for (let h = 0; h < 24; h++) {
    const hourStr = h.toString().padStart(2, "0") + ":00";

    hours.push({
      time: hourStr,
      height: interpolateHeight(tideEvents, hourStr)
    });
  }


  return hours.map((hour) => {
    const boundingTides = findBoundingTides(
      hour.time,
      tideEvents
    );

    const tideStage = boundingTides
      ? classifyTideStage(
          boundingTides.progress,
          boundingTides.direction
        )
      : "Unknown";

    return {
      time: hour.time,
      height: hour.height,
      tideStage,

      solunarStrength: null,
      pressureTrend: null,
      weatherCondition: null,
      wind: null,

      hourScore: null
    };
  });
}
