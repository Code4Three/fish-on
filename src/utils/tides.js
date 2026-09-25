import { formatLocalDate, formatLocalTime } from "./dateUtils.js";

export function groupTidesByDay(records) {
  const days = {};

  records.forEach((rec) => {
    const date = new Date(rec.date);
    const localDate = formatLocalDate(date);
    const localTime = formatLocalTime(date);

    if (!days[localDate]) {
      days[localDate] = {
        date: localDate,
        highTides: [],
        lowTides: [],
        tideEvents: [],
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
      type: rec.type,
    });
  });

  const sortByTime = (a, b) => {
    const [ah, am] = a.time.split(":").map(Number);
    const [bh, bm] = b.time.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  };

  return Object.values(days).map((day) => {
    day.tideEvents.sort(sortByTime);
    day.highTides.sort(sortByTime);
    day.lowTides.sort(sortByTime);
    return day;
  });
}

export function classifyTideStage(progress, direction) {
  if (progress == null || direction == null) {
    return "Unknown";
  }

  if (direction === "incoming") {
    if (progress < 0.25) return "Run In Start";
    if (progress < 0.5) return "Run In Building";
    if (progress < 0.75) return "Run In Mid";

    return "Run In Late";
  }

  if (direction === "outgoing") {
    if (progress < 0.25) return "Run Out Start";
    if (progress < 0.5) return "Run Out Building";
    if (progress < 0.75) return "Run Out Mid";

    return "Run Out Late";
  }

  return "Unknown";
}
