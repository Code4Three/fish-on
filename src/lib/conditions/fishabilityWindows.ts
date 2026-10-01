import type { ClaudeHourlyData } from "../../data/conditions";

export interface FishabilityWindow {
    start: number;
    end: number;
    peakScore: number;
    highestBand: "Peak" | "Strong" | "Favorable";
}

/**
 * Identifies favorable fishability windows based on Peak/Strong/Favorable score hours.
 * Creates windows around each favorable hour with a configurable margin, then merges overlapping windows.
 * 
 * Note on precision: Since hourly data uses integer indices (0-23) and the margin is typically 1.5 hours,
 * window boundaries will naturally fall on half-hour increments (e.g., 1.5, 2.5, 3.5). This produces
 * time displays like "1:30 AM - 4:30 AM". This is correct behavior and creates a visually consistent pattern.
 * 
 * @param hours - Array of hourly data with score bands (indices 0-23 for 12 AM to 11 PM)
 * @param margin - Hours to expand on either side of favorable score hours (creates decimal boundaries)
 * @returns Array of non-overlapping windows, sorted by start time, with boundaries clamped to [0, 24)
 */
export function identifyFishabilityFavorableWindows(
    hours: ClaudeHourlyData[],
    margin: number,
): FishabilityWindow[] {
    if (!hours || hours.length === 0) return [];

    // Identify all hours with favorable score bands (Peak, Strong, Favorable - not Slow)
    const favorableBands: Array<{ hour: number; band: "Peak" | "Strong" | "Favorable" }> = [];
    for (const h of hours) {
        if (h.scoreBand === "Peak" || h.scoreBand === "Strong" || h.scoreBand === "Favorable") {
            favorableBands.push({ hour: h.hour, band: h.scoreBand });
        }
    }

    if (favorableBands.length === 0) return [];

    // Create initial windows around each favorable hour
    const initialWindows: Array<{ start: number; end: number; peakScore: number; band: "Peak" | "Strong" | "Favorable" }> = [];
    for (const { hour, band } of favorableBands) {
        const peakScore = hours.find(h => h.hour === hour)?.score ?? 0;
        initialWindows.push({
            start: hour - margin,
            end: hour + margin,
            peakScore,
            band,
        });
    }

    // Sort by start time
    initialWindows.sort((a, b) => a.start - b.start);

    // Merge overlapping windows, keeping the highest band for each merged window
    const mergedWindows: Array<{ start: number; end: number; peakScore: number; highestBand: "Peak" | "Strong" | "Favorable" }> = [];
    for (const window of initialWindows) {
        if (mergedWindows.length === 0) {
            mergedWindows.push({
                start: window.start,
                end: window.end,
                peakScore: window.peakScore,
                highestBand: window.band,
            });
        } else {
            const lastWindow = mergedWindows[mergedWindows.length - 1];
            if (window.start <= lastWindow.end) {
                // Overlap: merge windows
                lastWindow.end = Math.max(lastWindow.end, window.end);
                lastWindow.peakScore = Math.max(lastWindow.peakScore, window.peakScore);
                // Update highest band (Peak > Strong > Favorable)
                const bandPriority = { Peak: 3, Strong: 2, Favorable: 1 };
                if (bandPriority[window.band] > bandPriority[lastWindow.highestBand]) {
                    lastWindow.highestBand = window.band;
                }
            } else {
                // No overlap: add new window
                mergedWindows.push({
                    start: window.start,
                    end: window.end,
                    peakScore: window.peakScore,
                    highestBand: window.band,
                });
            }
        }
    }

    // Clamp all window boundaries to [0, 24) since we only show today's hours (0-23)
    // Negative start values occur when margin extends before midnight; clamp to 0 (12:00 AM)
    // End values >= 24 occur when margin extends after midnight; clamp to 24 (12:00 AM next day)
    const clampedWindows = mergedWindows.map(w => ({
        ...w,
        start: Math.max(0, w.start),
        end: Math.min(24, w.end),
    }));

    return clampedWindows as FishabilityWindow[];
}
