const DEFAULT_RULES = {
  solunar: {
    baseWeights: { major: 60, minor: 30, neutral: 5 },
    maxScore: 99,
    phaseMultipliers: {
      "New Moon": 1,
      "Waxing Crescent": 0.8,
      "First Quarter": 0.6,
      "Waxing Gibbous": 0.85,
      "Full Moon": 1,
      "Waning Gibbous": 0.85,
      "Last Quarter": 0.6,
      "Waning Crescent": 0.75
    },
    solar: {
      dawnDuskMinutes: 45,
      exactDawnDuskBoost: 1.5,
      dawnDuskBoost: 1.45,
      solarNoonMinutes: 60,
      solarNoonBoost: 1.1
    },
    distance: {
      perigeeKm: 356500,
      apogeeKm: 406700,
      perigeeMultiplier: 1.1,
      apogeeMultiplier: 0.9
    }
  }
};

function toMinutes(time) {
  if (typeof time !== "string") return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function circularMinuteDistance(first, second) {
  const difference = Math.abs(first - second);
  return Math.min(difference, 1440 - difference);
}

function distanceMultiplier(distance, rules) {
  if (!Number.isFinite(distance)) return 1;

  const { perigeeKm, apogeeKm, perigeeMultiplier, apogeeMultiplier } = rules.distance;
  const range = apogeeKm - perigeeKm;
  if (range <= 0) return 1;

  const position = Math.max(0, Math.min(1, (distance - perigeeKm) / range));
  return perigeeMultiplier + position * (apogeeMultiplier - perigeeMultiplier);
}

function solarBoost(eventTime, anchored, rules) {
  const eventMinutes = toMinutes(eventTime);
  const sunrise = toMinutes(anchored?.sunrise);
  const sunset = toMinutes(anchored?.sunset);
  if (eventMinutes == null || sunrise == null || sunset == null) return 1;

  const dawnDuskDistance = Math.min(
    circularMinuteDistance(eventMinutes, sunrise),
    circularMinuteDistance(eventMinutes, sunset)
  );
  if (dawnDuskDistance <= rules.solar.dawnDuskMinutes) {
    if (dawnDuskDistance === 0) return rules.solar.exactDawnDuskBoost;
    return rules.solar.dawnDuskBoost;
  }

  const solarNoon = (sunrise + sunset) / 2;
  if (Math.abs(eventMinutes - solarNoon) <= rules.solar.solarNoonMinutes) {
    return rules.solar.solarNoonBoost;
  }

  return 1;
}

function baseWeight(peakType, rules) {
  if (peakType?.startsWith("Major")) return rules.baseWeights.major;
  if (peakType?.startsWith("Minor")) return rules.baseWeights.minor;
  return rules.baseWeights.neutral;
}

function phaseMultiplier(phase, rules) {
  return rules.phaseMultipliers[phase] ?? 1;
}

export function calculateSolunarPeakRating(peak, anchored, configuredRules = DEFAULT_RULES) {
  const rules = configuredRules.solunar ?? DEFAULT_RULES.solunar;
  const rawScore = baseWeight(peak?.type, rules)
    * phaseMultiplier(anchored?.moonPhase, rules)
    * solarBoost(peak?.time, anchored, rules)
    * distanceMultiplier(anchored?.moonDistance, rules);

  return Math.round(Math.min(100, (rawScore / rules.maxScore) * 100));
}

export function calculateNeutralSolunarRating(configuredRules = DEFAULT_RULES) {
  const rules = configuredRules.solunar ?? DEFAULT_RULES.solunar;
  return Math.round(Math.min(100, (rules.baseWeights.neutral / rules.maxScore) * 100));
}

export function isPeakActiveAtHour(peak, date, time) {
  if (!peak?.start || !peak?.end) return false;
  const hour = toMinutes(time);
  if (hour == null) return false;

  const dayOffset = point => point.date < date ? -1440 : point.date > date ? 1440 : 0;
  const start = toMinutes(peak.start.time) + dayOffset(peak.start);
  const end = toMinutes(peak.end.time) + dayOffset(peak.end);
  return hour >= start && hour < end;
}

export function calculateSolunarHourRating(day, time, configuredRules = DEFAULT_RULES) {
  const peaks = (day?.anchored?.solunarPeaks ?? [])
    .filter(peak => isPeakActiveAtHour(peak, day.date, time));

  if (!peaks.length) return calculateNeutralSolunarRating(configuredRules);

  return Math.max(
    ...peaks.map(peak => calculateSolunarPeakRating(peak, day.anchored, configuredRules))
  );
}
