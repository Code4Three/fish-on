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
      "Waning Crescent": 0.75,
    },
    solar: {
      dawnDuskMinutes: 45,
      exactDawnDuskBoost: 1.5,
      dawnDuskBoost: 1.45,
      solarNoonMinutes: 60,
      solarNoonBoost: 1.1,
    },
    distance: {
      perigeeKm: 356500,
      apogeeKm: 406700,
      perigeeMultiplier: 1.1,
      apogeeMultiplier: 0.9,
    },
  },
  solunar_v2: {
    baseScores: { major: 80, minor: 50, none: 0 },
    phase: {
      syzygyIlluminationThreshold: 5,
      syzygyMultiplier: 1.15,
      neapIlluminationMin: 45,
      neapIlluminationMax: 55,
      neapMultiplier: 0.85,
      defaultMultiplier: 1.0,
    },
    solar: {
      dawnDuskWindowMinutes: 45,
      dawnDuskMultiplier: 1.25,
      solarNoonWindowMinutes: 45,
      solarNoonMultiplier: 1.1,
      defaultMultiplier: 1.0,
    },
    distance: {
      perigeeKmMin: 356500,
      perigeeKmMax: 363350,
      perigeeMultiplier: 1.05,
      apogeeKmMin: 399850,
      apogeeKmMax: 406700,
      apogeeMultiplier: 0.95,
      defaultMultiplier: 1.0,
    },
  },
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

/**
 * Calculates phase multiplier based on moon illumination percentage.
 * Syzygy (New/Full Moon): > 1.15
 * Neap (First/Last Quarter): 0.85
 * Other: 1.0
 */
function calculatePhaseMultiplier(illumination, config) {
  if (typeof illumination !== "number" || !Number.isFinite(illumination)) {
    return config.phase.defaultMultiplier;
  }

  // Syzygy: New Moon (< 5%) or Full Moon (> 95%)
  if (illumination < config.phase.syzygyIlluminationThreshold ||
    illumination > (100 - config.phase.syzygyIlluminationThreshold)) {
    return config.phase.syzygyMultiplier;
  }

  // Neap: First Quarter / Last Quarter (45-55%)
  if (illumination >= config.phase.neapIlluminationMin &&
    illumination <= config.phase.neapIlluminationMax) {
    return config.phase.neapMultiplier;
  }

  return config.phase.defaultMultiplier;
}

/**
 * Calculates solar/crepuscular alignment multiplier based on event time.
 * Exact dawn/dusk (±45 min): 1.25
 * Solar noon/midnight (±45 min): 1.1
 * Standard daylight/night: 1.0
 */
function calculateSolarMultiplier(eventTime, anchored, config) {
  const eventMinutes = toMinutes(eventTime);
  const sunrise = toMinutes(anchored?.sunrise);
  const sunset = toMinutes(anchored?.sunset);

  if (eventMinutes == null || sunrise == null || sunset == null) {
    return config.solar.defaultMultiplier;
  }

  // Check dawn/dusk window
  const dawnDuskDistance = Math.min(
    circularMinuteDistance(eventMinutes, sunrise),
    circularMinuteDistance(eventMinutes, sunset),
  );
  if (dawnDuskDistance <= config.solar.dawnDuskWindowMinutes) {
    return config.solar.dawnDuskMultiplier;
  }

  // Check solar noon/midnight window
  const solarNoon = (sunrise + sunset) / 2;
  if (Math.abs(eventMinutes - solarNoon) <= config.solar.solarNoonWindowMinutes) {
    return config.solar.solarNoonMultiplier;
  }

  return config.solar.defaultMultiplier;
}

/**
 * Calculates lunar distance multiplier based on moon distance in kilometers.
 * Perigee (356500-363350 km): 1.05
 * Apogee (399850-406700 km): 0.95
 * Average orbit: 1.0
 */
function calculateDistanceMultiplier(moonDistance, config) {
  if (typeof moonDistance !== "number" || !Number.isFinite(moonDistance)) {
    return config.distance.defaultMultiplier;
  }

  // Perigee: closest 20% of orbit
  if (moonDistance >= config.distance.perigeeKmMin &&
    moonDistance <= config.distance.perigeeKmMax) {
    return config.distance.perigeeMultiplier;
  }

  // Apogee: farthest 20% of orbit
  if (moonDistance >= config.distance.apogeeKmMin &&
    moonDistance <= config.distance.apogeeKmMax) {
    return config.distance.apogeeMultiplier;
  }

  return config.distance.defaultMultiplier;
}

export function calculateSolunarPeakRating(
  peak,
  anchored,
  configuredRules = DEFAULT_RULES,
) {
  const config = configuredRules.solunar_v2 ?? DEFAULT_RULES.solunar_v2;

  // Map peak type to base score
  let baseScore = config.baseScores.none;
  if (peak?.type?.startsWith("Major")) {
    baseScore = config.baseScores.major;
  } else if (peak?.type?.startsWith("Minor")) {
    baseScore = config.baseScores.minor;
  }

  if (baseScore === 0) {
    return 0;
  }

  // Calculate multipliers
  const phaseMult = calculatePhaseMultiplier(anchored?.illumination, config);
  const solarMult = calculateSolarMultiplier(peak?.time, anchored, config);
  const distanceMult = calculateDistanceMultiplier(anchored?.moonDistance, config);

  // Apply formula: baseScore × phaseMult × solarMult × distanceMult
  const rawScore = baseScore * phaseMult * solarMult * distanceMult;

  // Clamp strictly between 0 and 100
  return Math.min(100, Math.round(rawScore));
}

export function calculateNeutralSolunarRating(
  // eslint-disable-next-line no-unused-vars
  configuredRules = DEFAULT_RULES,
) {
  // Under the new additive model, non-event windows return 0
  // Parameter kept for backward compatibility with existing callers
  return 0;
}

export function isPeakActiveAtHour(peak, date, time) {
  if (!peak?.start || !peak?.end) return false;
  const hour = toMinutes(time);
  if (hour == null) return false;

  const dayOffset = (point) =>
    point.date < date ? -1440 : point.date > date ? 1440 : 0;
  const start = toMinutes(peak.start.time) + dayOffset(peak.start);
  const end = toMinutes(peak.end.time) + dayOffset(peak.end);
  return hour >= start && hour < end;
}

export function calculateSolunarHourRating(
  day,
  time,
  configuredRules = DEFAULT_RULES,
) {
  const peaks = (day?.anchored?.solunarPeaks ?? []).filter((peak) =>
    isPeakActiveAtHour(peak, day.date, time),
  );

  if (!peaks.length) return calculateNeutralSolunarRating(configuredRules);

  return Math.max(
    ...peaks.map((peak) =>
      calculateSolunarPeakRating(peak, day.anchored, configuredRules),
    ),
  );
}
