// src/builders/groupTidesByDay.js

import {
  formatLocalDate,
  formatLocalTime
} from "../utils/dateUtils.js";

export function groupTidesByDay(records) {
  const days = {};

  records.forEach(rec => {
    const date = new Date(rec.date);
    const localDate = formatLocalDate(date);
    const localTime = formatLocalTime(date);

    if (!days[localDate]) {
      days[localDate] = {
        date: localDate,
        highTides: [],
        lowTides: [],
        tideEvents: []
      };
    }

    if (rec.type === "High") {
      days[localDate].highTides.push({ time: localTime, height: rec.height });
    }

    if (rec.type === "Low") {
      days[localDate].lowTides.push({ time: localTime, height: rec.height });
    }

    days[localDate].tideEvents.push({
      time: localTime,
      height: rec.height,
      type: rec.type
    });
  });

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
