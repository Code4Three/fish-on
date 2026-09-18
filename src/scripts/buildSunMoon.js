import fs from "fs";
import path from "path";
import * as SunCalc from "suncalc";

import { LOCATION } from "../config/constants.js";
import {
  getBuildDates,
  formatLocalDate,
  formatLocalTime
} from "../utils/dateUtils.js";


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

const days = [];

for (const date of getBuildDates()) {
  const sunTimes = SunCalc.getTimes(
    date,
    LOCATION.lat,
    LOCATION.lon
  );

  const moonTimes = SunCalc.getMoonTimes(
    date,
    LOCATION.lat,
    LOCATION.lon
  );

  const moonIllumination =
    SunCalc.getMoonIllumination(date);

  days.push({
    date: formatLocalDate(date),

    sunrise: formatLocalTime(sunTimes.sunrise),
    sunset: formatLocalTime(sunTimes.sunset),
    moonrise: formatLocalTime(moonTimes.rise),
    moonset: formatLocalTime(moonTimes.set),

    moonPhase: getMoonPhaseName(
      moonIllumination.phase
    ),

    illumination: Math.round(
      moonIllumination.fraction * 100
    )
  });
}

const outputPath = path.join(
  "src",
  "data",
  "sunMoon.json"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    { days },
    null,
    2
  )
);

console.log(
  "Sun/Moon data written → src/data/sunMoon.json"
);