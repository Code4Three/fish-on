const DEFAULT_RATING = 0;

export function calculateConditionScore(tideData, solunarData, config) {
  const weights = config?.weights ?? {};
  const tideWeight = getWeight(weights.tide);
  const solunarWeight = getWeight(weights.solunar);

  if (Math.abs(tideWeight + solunarWeight - 1) > 0.000001) {
    throw new Error("Tide and solunar weights must sum to 1.0");
  }

  const tideRating = normalizeRating(tideData);
  const solunarRating = normalizeRating(solunarData);
  const score = (tideRating * tideWeight) + (solunarRating * solunarWeight);

  return {
    score,
    band: getScoreBand(score, config?.bands ?? [])
  };
}

export function calculateTideRating(at, tideEvents, config) {
  const peakWindowHours = config?.tide?.peakWindowHours ?? 2;
  const decayPerHour = config?.tide?.decayPerHour ?? 25;
  const runInWindows = [];

  for (let index = 1; index < tideEvents.length; index++) {
    const previous = tideEvents[index - 1];
    const current = tideEvents[index];

    if (previous.type !== "Low" || current.type !== "High") continue;

    runInWindows.push({
      start: current.at - peakWindowHours * 60 * 60 * 1000,
      end: current.at
    });
  }

  if (!runInWindows.length) return 0;

  const distanceHours = Math.min(...runInWindows.map(window => {
    if (at >= window.start && at <= window.end) return 0;

    const distance = at < window.start
      ? window.start - at
      : at - window.end;
    return distance / (60 * 60 * 1000);
  }));

  return Math.max(0, 100 - (distanceHours * decayPerHour));
}

export function getScoreBand(score, bands) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const orderedBands = [...bands].sort((a, b) => a.min - b.min);

  return orderedBands.find((band, index) => {
    const nextBand = orderedBands[index + 1];
    return normalizedScore >= band.min &&
      (!nextBand || normalizedScore < nextBand.min);
  }) ?? null;
}

function getWeight(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeRating(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }

  return DEFAULT_RATING;
}
