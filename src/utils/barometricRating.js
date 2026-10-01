// Barometric Pressure Scoring Matrix & Trend Engine (V1)
//
// Scores a single hourly pressure reading 0-100 and classifies it into one of five
// industry-standard fishing states. The 3-hour trend (direction + rate of change)
// is weighted more heavily than the static pressure reading: two hard gates (OFF/POOR)
// are evaluated first from either signal alone, then the remaining tiers are chosen by
// trend bucket first, with the ideal pressure range for that trend refining the score.
const DEFAULT_RULES = {
    barometric: {
        // Below this pressure, OR at/below this trend delta, the state is always OFF
        off: { hpaBelow: 1002, trendDeltaAtOrBelow: -2.5 },
        // Above this pressure, OR above this trend delta, the state is always POOR
        poor: { hpaAbove: 1022, trendDeltaAbove: 2.0 },
        tiers: {
            PEAK: {
                score: 100,
                minHpa: 1008,
                maxHpa: 1018,
                minTrendDelta: -2.0,
                maxTrendDelta: -0.5,
                description:
                    "Aggressive Feeding Window: Pre-front pressure drop triggers instinctual feeding frenzy. Lures/baits heavily favored.",
            },
            HIGH: {
                score: 80,
                minHpa: 1012,
                maxHpa: 1020,
                minTrendDelta: -0.5,
                maxTrendDelta: 0.5,
                description:
                    "Stable / Predictable: Fish follow standard tide-driven routines. Clear water, consistent feeding.",
            },
            MODERATE: {
                score: 60,
                minHpa: 1008,
                maxHpa: 1016,
                minTrendDelta: 0.5,
                maxTrendDelta: 2.0,
                description:
                    "Recovering: Post-front recovery phase. Moderate activity; standard presentations near structure.",
            },
        },
        poorDescription:
            "Lethargic / Technical: High atmospheric pressure causes fish to hold deep in cover/shade. Slow, downsized retrieves required.",
        offDescription:
            "Shut Down / Storm Active: Active storm front or extreme low pressure locks feeding down completely.",
        // Score deducted per hPa the reading sits outside a tier's ideal range, capped so a
        // pressure/trend mismatch never drops a tier below this floor.
        hpaOutsideRangePenaltyPerHpa: 4,
        maxOutsideRangePenalty: 20,
        outsideRangeScoreFloor: 10,
    },
};

function pressureDistanceOutsideRange(hpa, minHpa, maxHpa) {
    if (hpa < minHpa) return minHpa - hpa;
    if (hpa > maxHpa) return hpa - maxHpa;
    return 0;
}

/**
 * @param {{ currentHpa: number, hpa3HoursAgo: number | null }} input
 * @param {typeof DEFAULT_RULES} configuredRules
 * @returns {{ score: number, state: "PEAK" | "HIGH" | "MODERATE" | "POOR" | "OFF", trendDelta: number, description: string }}
 */
export function evalBarometricCondition(input, configuredRules = DEFAULT_RULES) {
    const rules = configuredRules.barometric ?? DEFAULT_RULES.barometric;
    const hasCurrentReading = input?.currentHpa != null && Number.isFinite(Number(input.currentHpa));
    const currentHpa = hasCurrentReading ? Number(input.currentHpa) : NaN;
    const hasPriorReading = input?.hpa3HoursAgo != null && Number.isFinite(Number(input.hpa3HoursAgo));
    const previousHpa = hasPriorReading ? Number(input.hpa3HoursAgo) : null;
    // Treat a missing prior reading (e.g. first hours of the dataset) as a steady trend
    const trendDelta = Number.isFinite(currentHpa) && previousHpa !== null
        ? currentHpa - previousHpa
        : 0;

    if (!Number.isFinite(currentHpa)) {
        return { score: 0, state: "OFF", trendDelta: 0, description: rules.offDescription };
    }

    if (currentHpa < rules.off.hpaBelow || trendDelta <= rules.off.trendDeltaAtOrBelow) {
        return { score: 0, state: "OFF", trendDelta, description: rules.offDescription };
    }

    if (currentHpa > rules.poor.hpaAbove || trendDelta > rules.poor.trendDeltaAbove) {
        return { score: 30, state: "POOR", trendDelta, description: rules.poorDescription };
    }

    // Trend direction decides the base tier; the tier's ideal pressure range then refines the score.
    const tierKey =
        trendDelta <= rules.tiers.PEAK.maxTrendDelta
            ? "PEAK"
            : trendDelta < rules.tiers.HIGH.maxTrendDelta
                ? "HIGH"
                : "MODERATE";
    const tier = rules.tiers[tierKey];

    const distance = pressureDistanceOutsideRange(currentHpa, tier.minHpa, tier.maxHpa);
    const penalty = Math.min(rules.maxOutsideRangePenalty, distance * rules.hpaOutsideRangePenaltyPerHpa);
    const score = Math.max(rules.outsideRangeScoreFloor, Math.round(tier.score - penalty));

    return { score, state: tierKey, trendDelta, description: tier.description };
}
