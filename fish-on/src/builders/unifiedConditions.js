// src/builders/unifiedConditions.js

import fs from "fs";
import path from "path";
import { groupTidesByDay } from "./groupTidesByDay.js";
import { classifyTideStage } from "./tideStageClassifier.js";

export function buildUnifiedConditions() {
  const tidesPath = path.join("src", "data", "tides.json");
  const tides = JSON.parse(fs.readFileSync(tidesPath, "utf8"));

  const days = groupTidesByDay(tides.records);

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

      return {
        date: day.date,
        anchored: buildAnchored(day),
        hours: buildHourly(day, combinedEvents)
      };
    })
  };

  const outputPath = path.join("public", "conditions.json");
  fs.writeFileSync(outputPath, JSON.stringify(unified, null, 2));

  console.log("Unified conditions written → public/conditions.json");
}

function buildAnchored(day) {
  return {
    highTides: day.highTides,
    lowTides: day.lowTides,

    sunrise: null,
    sunset: null,
    moonrise: null,
    moonset: null,
    moonPhase: null,
    solunarPeaks: [],

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

function buildHourly(day, tideEvents) {
  const hours = [];

  for (let h = 0; h < 24; h++) {
    const hourStr = h.toString().padStart(2, "0") + ":00";

    hours.push({
      time: hourStr,
      height: interpolateHeight(tideEvents, hourStr)
    });
  }

  console.log(day);
  console.log(hours);

  return hours.map((hour, i) => {
    const prev = hours[i - 1]?.height ?? null;
    const next = hours[i + 1]?.height ?? null;

    return {
      time: hour.time,
      tideStage: classifyTideStage(prev, hour.height, next),

      solunarStrength: null,
      pressureTrend: null,
      weatherCondition: null,
      wind: null,

      hourScore: null
    };
  });
}
