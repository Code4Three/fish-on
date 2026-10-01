import { useEffect, useMemo, useState } from "react";
import { buildDayData } from "../data/conditions";
import { applyCurrentObservation } from "../data/runtimeConditions.js";
import { useApp } from "../state/useApp";
import { getRuntimeTodayIndex } from "../data/runtimeConditions";
import { useConditions } from "../hooks/useConditions";
import MainDashboard from "./MainDashboard";
import { DEFAULT_HOUR } from "./shared";

function getLocationHour(timezone: string): number {
    const hour = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        hourCycle: "h23",
    }).format(new Date());
    return Number(hour);
}

// Owns the date/hour state for the weekly forecast route and renders the dashboard.
export default function WeeklyDashboard() {
    const { activeLocation } = useApp();
    const { days, loading, error, current } = useConditions(activeLocation);
    const [offset, setOffset] = useState(0);
    const [hour, setHour] = useState(DEFAULT_HOUR);
    const [syncedLocationId, setSyncedLocationId] = useState<string | null>(null);

    useEffect(() => {
        if (syncedLocationId === activeLocation.id || days.length === 0) return;
        const todayIndex = getRuntimeTodayIndex(
            days,
            activeLocation.timezone,
        );
        if (todayIndex >= 0) setOffset(todayIndex);
        setHour(getLocationHour(activeLocation.timezone));
        setSyncedLocationId(activeLocation.id);
    }, [activeLocation, days, syncedLocationId]);

    const maxOffset = Math.max(0, days.length - 1);
    // Clamp so an out-of-range offset (e.g. stale localStorage) can't index past the loaded days
    const clampedOffset = Math.min(Math.max(offset, 0), maxOffset);
    const forecastDay = useMemo(
        () => (days.length ? buildDayData(days, clampedOffset, activeLocation.timezone) : null),
        [activeLocation.timezone, days, clampedOffset],
    );
    const day = useMemo(
        () => forecastDay
            ? applyCurrentObservation(forecastDay, current, activeLocation.timezone)
            : null,
        [activeLocation.timezone, current, forecastDay],
    );

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-hull-950 px-6 text-center font-body text-[14px] text-slate-300">
                Loading conditions…
            </main>
        );
    }

    if (error || !day) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-hull-950 px-6 text-center font-body text-[14px] text-slate-300">
                {error ?? "No conditions data is available right now."}
            </main>
        );
    }

    return (
        <MainDashboard
            day={day}
            locationName={activeLocation.name}
            timezone={activeLocation.timezone}
            isLiveWeather={day.hours[hour]?.weatherSource === "current"}
            hour={hour}
            offset={clampedOffset}
            canGoPrevious={clampedOffset > 0}
            canGoNext={clampedOffset < maxOffset}
            onHourChange={setHour}
            onOffsetChange={(nextOffset: number) =>
                setOffset(Math.min(Math.max(nextOffset, 0), maxOffset))
            }
        />
    );
}
