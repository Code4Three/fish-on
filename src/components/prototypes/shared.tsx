import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Fish,
  Gauge,
  Moon,
  Sun,
  Thermometer,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { ENVIRONMENTAL_METRICS } from "../../config/metricMatrix";
import type { ClaudeDayData } from "../../data/conditions";
import type { AnchoredSettingsState } from "../../hooks/useAnchoredSettings";
import type { PrototypeId } from "../../hooks/useLayoutPrototype";
import {
  formatMetricLabel,
  formatMetricRange,
  formatMetricValue,
  getMetricUnit,
} from "../../utils/measurementUnits";
import { useUnitSystem } from "../../state/useApp";

export interface DashboardStateProps {
  day: ClaudeDayData;
  locationName: string;
  timezone: string;
  isLiveWeather?: boolean;
  hour: number;
  offset: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onHourChange: (hour: number) => void;
  onOffsetChange: (offset: number) => void;
  prototype: PrototypeId;
  onSelectPrototype: (id: PrototypeId) => void;
}

export const DEFAULT_HOUR = 7;

export type MetricKey = keyof AnchoredSettingsState;

export const metrics: Array<{
  id: MetricKey;
  label: string;
  icon: typeof Wind;
  tint: string;
  ring: string;
}> = [
    {
      id: "wind",
      label: "Wind",
      icon: Wind,
      tint: "text-sky-300",
      ring: "bg-sky-400/10",
    },
    {
      id: "waterTemp",
      label: "Water temp",
      icon: Thermometer,
      tint: "text-orange-300",
      ring: "bg-orange-400/10",
    },
    {
      id: "swell",
      label: "Swell",
      icon: Waves,
      tint: "text-cyan-300",
      ring: "bg-cyan-400/10",
    },
    {
      id: "moonPhase",
      label: "Moon phase",
      icon: Moon,
      tint: "text-indigo-300",
      ring: "bg-indigo-400/10",
    },
    {
      id: "rain",
      label: "Rain",
      icon: CloudRain,
      tint: "text-blue-300",
      ring: "bg-blue-400/10",
    },
    {
      id: "uv",
      label: "UV index",
      icon: Sun,
      tint: "text-yellow-300",
      ring: "bg-yellow-400/10",
    },
    {
      id: "airTemp",
      label: "Air temp",
      icon: Cloud,
      tint: "text-emerald-200",
      ring: "bg-emerald-400/10",
    },
  ];

// ==========================================
// FORMATTERS & LABEL HELPERS
// ==========================================
export function formatHour(hour: number, minutes = false) {
  const wholeHour = Math.floor(hour);
  const display = wholeHour % 12 || 12;
  return `${display}${minutes ? `:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}` : ""} ${wholeHour >= 12 ? "PM" : "AM"}`;
}

export function formatOptionalHour(
  hour: number | null | undefined,
  minutes = false,
) {
  return hour == null ? "--" : formatHour(hour, minutes);
}

export function formatDate(dateValue: string, timezone: string) {
  const [year, monthNumber, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, day, 12));
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const todayValues = Object.fromEntries(
    todayParts.map(({ type, value }) => [type, Number(value)]),
  );
  const todayTimestamp = Date.UTC(
    todayValues.year,
    todayValues.month - 1,
    todayValues.day,
  );
  const dateTimestamp = Date.UTC(year, monthNumber - 1, day);
  const dayDifference = Math.round((dateTimestamp - todayTimestamp) / 86400000);
  const month = date.toLocaleDateString("en-AU", {
    month: "short",
    timeZone: timezone,
  });
  const weekday = date.toLocaleDateString("en-AU", {
    weekday: "short",
    timeZone: timezone,
  });
  if (dayDifference === 0) return `Today, ${day} ${month}`;
  if (dayDifference === 1) return `Tomorrow, ${day} ${month}`;
  if (dayDifference === -1) return `Yesterday, ${day} ${month}`;
  return `${weekday}, ${day} ${month}`;
}

export function solunarLabel(level: ClaudeDayData["hours"][number]["solunar"]) {
  if (level === "major") return "Major Solunar Window";
  if (level === "minor") return "Minor Solunar Window";
  return "Low Solunar Activity";
}

export function ratingTier(value: number) {
  if (value >= 80) return "Peak";
  if (value >= 60) return "Good";
  if (value >= 40) return "Fair";
  return "Slow";
}

export function uvLabel(value: number) {
  if (value <= 2) return "Low";
  if (value <= 5) return "Moderate";
  if (value <= 7) return "High";
  if (value <= 10) return "Very High";
  return "Extreme";
}

export function scoreBandTone(band: string) {
  if (band === "Peak" || band === "Strong")
    return {
      text: "text-tide-400",
      chip: "bg-tide-500/15 text-tide-400",
      stroke: "#4ADE9C",
    };
  if (band === "Favorable")
    return {
      text: "text-amber-300",
      chip: "bg-amber-400/15 text-amber-300",
      stroke: "#FCD34D",
    };
  return {
    text: "text-slate-300",
    chip: "bg-hull-700 text-slate-300",
    stroke: "#94A3B8",
  };
}

// Renders a placeholder when mock data for a metric is missing/unavailable (AC3).
export function safe<T>(
  value: T | null | undefined,
  fallback = "--",
): T | string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isNaN(value)) return fallback;
  return value;
}

export function formatTideHeight(value: number | null | undefined): string {
  return value == null ? "--" : value.toFixed(1);
}

export function isTideRising(day: ClaudeDayData, hour: number): boolean {
  const current = day.hours[hour];
  const next = day.hours[Math.min(day.hours.length - 1, hour + 1)] ?? current;
  const currentValue =
    typeof current?.tideHeight === "number" ? current.tideHeight : null;
  const nextValue =
    typeof next?.tideHeight === "number" ? next.tideHeight : null;

  if (currentValue == null || nextValue == null) return false;
  return nextValue > currentValue;
}

export function solunarStatusTrend(day: ClaudeDayData, hour: number): string {
  const windows = [
    ...(day.majorWindows ?? []).map((window) => ({
      type: "Major",
      start: window.start,
      end: window.end,
    })),
    ...(day.minorWindows ?? []).map((window) => ({
      type: "Minor",
      start: window.start,
      end: window.end,
    })),
  ];

  for (const window of windows) {
    if (window.start === undefined || window.end === undefined) continue;
    if (hour >= window.start && hour <= window.end)
      return `Peak (${window.type})`;
    if (hour >= window.start - 0.75 && hour < window.start)
      return `Building (${window.type})`;
    if (hour > window.end && hour <= window.end + 0.75)
      return `Fading (${window.type})`;
  }
  return "Neutral";
}

export function getMetricDisplay(
  id: MetricKey,
  day: ClaudeDayData,
  hour: number,
  unitSystem: "metric" | "imperial" = "metric",
): [string, string, string] {
  const current = day.hours[hour];
  const wind = current.wind;
  const uv = current.uvIndex ?? day.secondary.uv;
  const formatValue = (metricId: string, value: number | string | null | undefined) =>
    formatMetricValue(metricId, value, unitSystem, false);
  const data: Record<MetricKey, [string, string, string]> = {
    wind: [
      formatValue("wind", wind.speed),
      getMetricUnit("wind", unitSystem),
      `${wind.dir} · Gusts ${formatMetricValue("gust", wind.gust, unitSystem)}`,
    ],
    waterTemp: [
      formatValue("waterTemp", current.seaSurfaceTemperature),
      getMetricUnit("waterTemp", unitSystem),
      "Surface reading",
    ],
    swell: [
      formatValue("swell", current.swellWaveHeight),
      getMetricUnit("swell", unitSystem),
      current.swellWaveHeight == null
        ? "--"
        : `@ ${formatMetricValue("swellWavePeriod", current.swellWavePeriod, unitSystem, false)}s ${current.swellWaveDirection ?? "--"}`,
    ],
    moonPhase: [
      `${safe(day.secondary.moon.illum)}`,
      "%",
      `${safe(day.secondary.moon.phaseName)}`,
    ],
    rain: [
      formatValue("rainChance", current.rainChance),
      getMetricUnit("rain", unitSystem),
      current.rainVolume == null
        ? "--"
        : `${formatMetricValue("rainVolume", current.rainVolume, unitSystem)} accumulated`,
    ],
    uv: [`${safe(uv)}`, "", uv == null ? "--" : uvLabel(uv)],
    airTemp: [
      formatValue("airTemp", current.airTemp),
      getMetricUnit("airTemp", unitSystem),
      `Feels ${formatMetricValue("feelsLike", current.feelsLike, unitSystem)}`,
    ],
  };
  return data[id];
}

// ==========================================
// SMALL PRESENTATIONAL COMPONENTS
// ==========================================
export function StepButton({
  label,
  direction,
  disabled = false,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 items-center gap-1 rounded-xl px-3 font-body text-[13px] font-semibold ${disabled ? "text-slate-600" : "text-slate-200 active:bg-hull-800"}`}
    >
      {direction === "left" && <ChevronLeft size={18} />}
      {label}
      {direction === "right" && <ChevronRight size={18} />}
    </button>
  );
}

export interface HourPillsProps {
  hour: number;
  day: ClaudeDayData;
  onHourChange: (hour: number) => void;
}

// Standalone hour-pill row (≥48px targets) for prototypes that place it away from the top header.
export function HourPills({ hour, day, onHourChange }: HourPillsProps) {
  const pillRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  useEffect(() => {
    pillRefs.current[hour]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [hour]);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {day.hours.map(({ hour: value }) => (
        <button
          key={value}
          ref={(element) => {
            pillRefs.current[value] = element;
          }}
          type="button"
          onClick={() => onHourChange(value)}
          aria-current={value === hour ? "time" : undefined}
          className={`flex h-12 shrink-0 items-center rounded-full px-3.5 font-body text-[13px] font-semibold ${value === hour ? "bg-tide-500 text-hull-950" : "border border-hull-700 bg-hull-800 text-slate-300"}`}
        >
          {formatHour(value)}
        </button>
      ))}
    </div>
  );
}

export interface SparklineProps {
  values: number[];
  activeIndex: number;
  stroke: string;
  dotColor?: string;
  label: string;
  height?: number;
  width?: number;
}

export function Sparkline({
  values,
  activeIndex,
  stroke,
  dotColor,
  label,
  height = 46,
  width = 280,
}: SparklineProps) {
  const validValues = values
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => Number.isFinite(value));

  if (validValues.length === 0) return null;

  const min = Math.min(...validValues.map(({ value }) => value));
  const max = Math.max(...validValues.map(({ value }) => value));
  const xDenominator = Math.max(values.length - 1, 1);
  const points = validValues
    .map(
      ({ value, index }) =>
        `${(index / xDenominator) * width},${height - ((value - min) / (max - min || 1)) * height}`,
    )
    .join(" ");
  const requestedIndex = Number.isFinite(activeIndex)
    ? Math.max(0, Math.min(activeIndex, values.length - 1))
    : 0;
  const activeValue = validValues.reduce((nearest, candidate) =>
    Math.abs(candidate.index - requestedIndex) <
      Math.abs(nearest.index - requestedIndex)
      ? candidate
      : nearest,
  );
  const activeX = (activeValue.index / xDenominator) * width;
  const activeY =
    height - ((activeValue.value - min) / (max - min || 1)) * height;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-9 flex-1"
      preserveAspectRatio="none"
      aria-label={label}
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".55"
      />
      <circle
        cx={activeX}
        cy={activeY}
        r="4.5"
        fill={dotColor ?? stroke}
        stroke="#070B13"
        strokeWidth="2"
      />
    </svg>
  );
}

// ==========================================
// SUMMARY CARDS (Prototype 0 / 1 stacked feed)
// ==========================================
export function ScoreCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const values = day.hours.map((item) => item.score);
  const current = day.hours[hour];
  const tone = scoreBandTone(current.scoreBand);
  const nextPeak = day.hours.find(
    (item) =>
      item.hour > hour &&
      (item.scoreBand === "Peak" || item.scoreBand === "Strong"),
  );

  return (
    <article className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Fish size={13} className={tone.text} />
          {formatMetricLabel("hourlyScore", unitSystem)}
        </div>
        {isVisible(visibleMetrics, "hourlyScore") && (
          <div className="mt-1 flex items-center gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
                {current.score}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${tone.chip}`}
              >
                {current.scoreBand}
              </span>
            </div>
            <Sparkline
              values={values}
              activeIndex={hour}
              stroke={tone.stroke}
              label="Fishing score trend"
            />
          </div>
        )}
        {isVisible(visibleMetrics, "feedingWindows") && (
          <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
            <span className="font-body text-[13px] font-medium text-slate-300">
              {nextPeak ? "Next strong window" : "Based on tide + solunar"}
            </span>
            <span className="font-body text-[13px] font-semibold tabular-nums text-white">
              {nextPeak
                ? `${formatHour(nextPeak.hour)} (${nextPeak.score})`
                : "No stronger window today"}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function TideCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const values = day.hours
    .map((item) => item.tideHeight)
    .filter((value): value is number => typeof value === "number");
  const current = day.hours[hour];
  const nextEvent =
    day.tideEvents.find((event) => event.hour >= hour) ?? day.tideEvents[0];
  const rising = isTideRising(day, hour);

  return (
    <article className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Waves size={13} className="text-tide-400" />
          {formatMetricLabel("tide", unitSystem)}
        </div>
        {isVisible(visibleMetrics, "currentTide") && (
          <div className="mt-1 flex items-center gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
                {formatMetricValue("tide", current?.tideHeight, unitSystem)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${rising ? "bg-tide-500/15 text-tide-400" : "bg-amber-400/15 text-amber-300"}`}
              >
                {rising ? "Rising" : "Falling"}
              </span>
            </div>
            <Sparkline
              values={values}
              activeIndex={hour}
              stroke="#22C58A"
              dotColor="#4ADE9C"
              label="Tide height trend"
            />
          </div>
        )}
        {isVisible(visibleMetrics, "nextTide") && (
          <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
            <span className="font-body text-[13px] font-medium text-slate-300">
              {formatMetricLabel("nextTide", unitSystem)}
            </span>
            <span className="font-body text-[13px] font-semibold tabular-nums text-white">
              {nextEvent
                ? `${nextEvent.type}: ${formatHour(nextEvent.hour, true)} (${formatMetricValue("tide", nextEvent.height, unitSystem)})`
                : safe(null)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function SolunarCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const windows = [
    ...(day.majorWindows ?? []).map((window) => ({
      type: "Major",
      start: window.start,
      end: window.end,
      rating: window.rating,
    })),
    ...day.minorWindows.map((window) => ({
      type: "Minor",
      start: window.start,
      end: window.end,
      rating: window.rating,
    })),
  ];
  const activeWindow =
    windows.find((window) => hour >= window.start && hour < window.end) ??
    windows.find((window) => window.start >= hour) ??
    windows[0];
  const current = day.hours[hour];

  return (
    <article className="mt-2 rounded-3xl border border-hull-700/70 bg-hull-800">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Moon size={13} className="text-indigo-300" />
          Solunar rating
        </div>
        {isVisible(visibleMetrics, "solunarFeedingWindows") && (
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
              {current?.solunarRating ?? 0}
              <span className="ml-0.5 align-top text-lg font-medium text-slate-400">
                /{day.solunarRating}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-tide-500/15 px-2.5 py-1 font-body text-xs font-semibold text-tide-400">
              <Fish size={14} />
              {ratingTier(current?.solunarRating ?? 0)}
            </span>
          </div>
        )}
        {isVisible(visibleMetrics, "solunarStatus") && (
          <div className="mt-2 flex items-center gap-2.5 border-t border-hull-700/70 pt-2">
            <Fish size={16} className="text-slate-300" />
            <div className="leading-tight">
              <p className="font-body text-[11.5px] text-slate-500">
                Active feeding window
              </p>
              <p className="font-display text-[14px] font-semibold text-white">
                {activeWindow.type}: {formatHour(activeWindow.start, true)} -{" "}
                {formatHour(activeWindow.end, true)} [{activeWindow.rating}]
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function PressureCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const current = day.hours[hour];
  const pressureRange = day.ranges?.pressure;
  const trend = day.secondary.pressure.trend;
  const trendTone =
    trend === "Falling"
      ? "text-amber-300"
      : trend === "Rising"
        ? "text-tide-400"
        : "text-slate-300";

  return (
    <article className="mx-4 mt-2 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Gauge size={13} className="text-amber-300" />
          {formatMetricLabel("pressure", unitSystem)}
        </div>
        {isVisible(visibleMetrics, "pressure") && (
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
              {formatMetricValue("pressure", current?.pressure, unitSystem, false)}
              <span className="ml-1 text-lg font-medium text-slate-400">
                {getMetricUnit("pressure", unitSystem)}
              </span>
            </span>
            <span
              className={`rounded-full bg-hull-700 px-2.5 py-1 font-body text-xs font-semibold ${trendTone}`}
            >
              {safe(trend, "Steady")}
            </span>
          </div>
        )}
        {isVisible(visibleMetrics, "pressure") && (
          <div className="mt-2 flex items-center justify-between border-t border-hull-700/70 pt-2">
            <span className="font-body text-[13px] font-medium text-slate-300">
              Today&apos;s range
            </span>
            <span className="font-body text-[13px] font-semibold tabular-nums text-white">
              {formatMetricRange("pressure", pressureRange, unitSystem)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function MetricCard({
  id,
  day,
  hour,
  variant = "card",
}: {
  id: MetricKey;
  day: ClaudeDayData;
  hour: number;
  variant?: "hero" | "card";
}) {
  const unitSystem = useUnitSystem();
  const metric = metrics.find((item) => item.id === id)!;
  const Icon = metric.icon;
  const [value, unit, detail] = getMetricDisplay(id, day, hour, unitSystem);

  return (
    <article
      className={`${variant === "hero" ? "min-h-[132px] p-4" : "min-h-[92px] p-3"} flex flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${metric.ring}`}
        >
          <Icon size={14} className={metric.tint} />
        </div>
        <p className="font-body text-[11.5px] leading-tight text-slate-400">
          {formatMetricLabel(id, unitSystem)}
        </p>
      </div>
      <div>
        <p
          className={`font-display font-bold leading-none tabular-nums text-white ${variant === "hero" ? "text-[34px]" : "text-[21px]"}`}
        >
          {value}
          <span className="ml-1 font-body text-[13px] font-medium text-slate-400">
            {unit}
          </span>
        </p>
        <p className="mt-1 truncate font-body text-[11px] text-slate-500">
          {detail}
        </p>
      </div>
    </article>
  );
}

// ==========================================
// MATRIX GROUP/METRIC COMPONENTS (MainDashboard card grid)
// ==========================================
function matrixMetricValue(
  id: string,
  day: ClaudeDayData,
  hour: number,
  unitSystem: "metric" | "imperial",
): [string, string] {
  const current = day.hours[hour];
  const nextPeak = day.hours.find(
    (item) =>
      item.hour > hour &&
      (item.scoreBand === "Peak" || item.scoreBand === "Strong"),
  );
  const range = day.ranges;
  const values: Record<string, [string, string]> = {
    hourlyScore: [`${current.score} ${current.scoreBand}`, "Current score"],
    maxDayScore: [
      `${Math.max(...day.hours.map((item) => item.score))}`,
      "Best hourly score",
    ],
    feedingWindows: [
      nextPeak ? formatHour(nextPeak.hour) : "--",
      "Next strong window",
    ],
    currentTide: [
      formatMetricValue("tide", current?.tideHeight, unitSystem),
      current?.tideStage ?? "--",
    ],
    nextTide: [
      day.tideEvents[0]
        ? `${day.tideEvents[0].type} ${formatHour(day.tideEvents[0].hour, true)}`
        : "--",
      "Next tide",
    ],
    waterTemperature: [
      formatMetricValue("waterTemperature", current.seaSurfaceTemperature, unitSystem),
      formatMetricRange("waterTemperature", range?.waterTemp, unitSystem),
    ],
    swell: [
      formatMetricValue("swell", current.swellWaveHeight, unitSystem),
      formatMetricRange("swell", day.environmentalRawSummaries?.swell?.dailyRange, unitSystem),
    ],
    solunarFeedingWindows: [
      String(day.majorWindows.length + day.minorWindows.length),
      "Feeding windows",
    ],
    solunarStatus: [solunarStatusTrend(day, hour), "Current trend"],
    moon: [
      `${day.secondary.moon.illum ?? "--"}%`,
      day.secondary.moon.phaseName ?? "Unavailable",
    ],
    sunrise: [
      `${formatOptionalHour(day.sun.sunrise, true)} / ${formatOptionalHour(day.sun.sunset, true)}`,
      "",
    ],
    firstLight: [
      `${formatOptionalHour(day.sun.firstLight, true)} / ${formatOptionalHour(day.sun.lastLight, true)}`,
      "",
    ],
    pressure: [
      formatMetricValue("pressure", current.pressure, unitSystem),
      formatMetricRange("pressure", day.environmentalRawSummaries?.pressure?.dailyRange, unitSystem),
    ],
    airTemperature: [
      formatMetricValue("airTemperature", current.airTemp, unitSystem),
      formatMetricRange("airTemperature", range?.airTemp, unitSystem),
    ],
    feelsLike: [
      formatMetricValue("feelsLike", current.feelsLike, unitSystem),
      formatMetricRange("feelsLike", range?.feelsLike, unitSystem),
    ],
    wind: [
      formatMetricValue("wind", current.wind.speed, unitSystem),
      formatMetricRange("wind", range?.wind, unitSystem),
    ],
    windDirection: [current.wind.dir ?? "--", ""],
    gust: [
      formatMetricValue("gust", current.wind.gust, unitSystem),
      formatMetricRange("gust", range?.gust, unitSystem),
    ],
    cloud: [
      formatMetricValue("cloud", current.cloudCover, unitSystem),
      formatMetricRange("cloud", day.environmentalRawSummaries?.cloud?.dailyRange, unitSystem),
    ],
    rainChance: [formatMetricValue("rainChance", current.rainChance, unitSystem), "Rain chance"],
    rainVolume: [
      formatMetricValue("rainVolume", current.rainVolume, unitSystem),
      "Rain volume",
    ],
    uv: [
      formatMetricValue("uv", current.uvIndex, unitSystem),
      formatMetricRange("uv", range?.uv, unitSystem, false),
    ],
  };
  return values[id] ?? ["--", "Unavailable"];
}

// Icon + tint per matrix metric id, used by both standalone metric cards and grouped tile layouts.
const metricIconMap: Record<string, { icon: typeof Wind; tint: string }> = {
  hourlyScore: { icon: Fish, tint: "text-tide-400" },
  maxDayScore: { icon: Fish, tint: "text-tide-400" },
  feedingWindows: { icon: Fish, tint: "text-tide-400" },
  currentTide: { icon: Waves, tint: "text-tide-400" },
  nextTide: { icon: Waves, tint: "text-tide-400" },
  waterTemperature: { icon: Thermometer, tint: "text-orange-300" },
  swell: { icon: Waves, tint: "text-cyan-300" },
  solunarFeedingWindows: { icon: Moon, tint: "text-indigo-300" },
  solunarStatus: { icon: Moon, tint: "text-indigo-300" },
  moon: { icon: Moon, tint: "text-indigo-300" },
  sunrise: { icon: Sun, tint: "text-yellow-300" },
  firstLight: { icon: Sun, tint: "text-yellow-300" },
  pressure: { icon: Gauge, tint: "text-amber-300" },
  airTemperature: { icon: Thermometer, tint: "text-emerald-200" },
  feelsLike: { icon: Thermometer, tint: "text-emerald-200" },
  wind: { icon: Wind, tint: "text-sky-300" },
  windDirection: { icon: Compass, tint: "text-sky-300" },
  gust: { icon: Wind, tint: "text-sky-300" },
  cloud: { icon: Cloud, tint: "text-slate-300" },
  rainChance: { icon: CloudRain, tint: "text-blue-300" },
  rainVolume: { icon: CloudRain, tint: "text-blue-300" },
  uv: { icon: Sun, tint: "text-yellow-300" },
  humidity: { icon: Droplets, tint: "text-sky-300" },
  dewPoint: { icon: Thermometer, tint: "text-emerald-200" },
  cloudCoverLow: { icon: Cloud, tint: "text-slate-300" },
  cloudCoverMid: { icon: Cloud, tint: "text-slate-300" },
  cloudCoverHigh: { icon: Cloud, tint: "text-slate-300" },
  cloudBase: { icon: Cloud, tint: "text-slate-300" },
  visibility: { icon: Eye, tint: "text-cyan-300" },
  waveHeight: { icon: Waves, tint: "text-cyan-300" },
  waveDirection: { icon: Compass, tint: "text-cyan-300" },
  wavePeriod: { icon: Waves, tint: "text-cyan-300" },
  windWaveHeight: { icon: Waves, tint: "text-cyan-300" },
  windWaveDirection: { icon: Compass, tint: "text-cyan-300" },
  windWavePeriod: { icon: Waves, tint: "text-cyan-300" },
  swellWaveDirection: { icon: Compass, tint: "text-cyan-300" },
  swellWavePeriod: { icon: Waves, tint: "text-cyan-300" },
};

const groupIconMap: Record<string, { icon: typeof Wind; tint: string }> = {
  fishability: { icon: Fish, tint: "text-tide-400" },
  tide: { icon: Waves, tint: "text-tide-400" },
  water: { icon: Waves, tint: "text-cyan-300" },
  solunar: { icon: Moon, tint: "text-indigo-300" },
  sunMoon: { icon: Moon, tint: "text-indigo-300" },
  weather: { icon: Cloud, tint: "text-sky-300" },
};

function GroupHeader({
  icon: Icon,
  tint,
  label,
}: {
  icon: typeof Wind;
  tint: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
      <Icon size={13} className={tint} />
      {label}
    </div>
  );
}

export function MatrixMetricCard({
  id,
  label,
  day,
  hour,
  hero = false,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  id: string;
  label: string;
  day: ClaudeDayData;
  hour: number;
  hero?: boolean;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
}) {
  const unitSystem = useUnitSystem();
  const [value, detail] = matrixMetricValue(id, day, hour, unitSystem);
  const metricLabel = formatMetricLabel(id, unitSystem);
  const meta = metricIconMap[id];
  const Icon = meta?.icon;
  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`${hero ? "min-h-[132px] p-4" : "min-h-[92px] p-3"} flex flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800`}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-hull-700/60">
            <Icon size={14} className={meta.tint} />
          </div>
        )}
        <p className="font-body text-[11.5px] leading-tight text-slate-400">
          {metricLabel === id ? label : metricLabel}
        </p>
      </div>
      <div className="mt-1">
        <p
          className={`${hero ? "text-[30px]" : "text-[21px]"} font-display font-bold leading-none tabular-nums text-white`}
        >
          {value}
        </p>
        {detail && (
          <p className="mt-1 truncate font-body text-[11px] text-slate-500">
            {detail}
          </p>
        )}
      </div>
    </article>
  );
}

// Fishing score group: merges hourly + max-day score into a single "current/max" hero number, as it was before grouping.
function FishabilityGroupContent({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const values = day.hours.map((item) => item.score);
  const current = day.hours[hour];
  const tone = scoreBandTone(current.scoreBand);
  const maxScore = Math.max(...values);
  const nextPeak = day.hours.find(
    (item) =>
      item.hour > hour &&
      (item.scoreBand === "Peak" || item.scoreBand === "Strong"),
  );
  const showHourly = isVisible(visibleMetrics, "hourlyScore");
  const showMax = isVisible(visibleMetrics, "maxDayScore");
  const showWindow = isVisible(visibleMetrics, "feedingWindows");

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={Fish} tint={tone.text} label={formatMetricLabel("hourlyScore", unitSystem)} />
      {(showHourly || showMax) && (
        <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
              {showHourly ? current.score : maxScore}
              {showHourly && showMax && (
                <span className="ml-0.5 align-top text-xl font-medium text-slate-400">
                  /{maxScore}
                </span>
              )}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${tone.chip}`}
            >
              {current.scoreBand}
            </span>
          </div>
          <Sparkline
            values={values}
            activeIndex={hour}
            stroke={tone.stroke}
            label="Fishing score trend"
          />
        </div>
      )}
      {showWindow && (
        <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">
            {nextPeak ? "Next strong window" : "Based on tide + solunar"}
          </span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">
            {nextPeak
              ? `${formatHour(nextPeak.hour)} (${nextPeak.score})`
              : "No stronger window today"}
          </span>
        </div>
      )}
    </div>
  );
}

function TideGroupContent({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const values = day.hours
    .map((item) => item.tideHeight)
    .filter((value): value is number => typeof value === "number");
  const current = day.hours[hour];
  const nextEvent =
    day.tideEvents.find((event) => event.hour >= hour) ?? day.tideEvents[0];
  const rising = isTideRising(day, hour);

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={Waves} tint="text-tide-400" label={formatMetricLabel("tide", unitSystem)} />
      {isVisible(visibleMetrics, "currentTide") && (
        <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
              {formatMetricValue("tide", current?.tideHeight, unitSystem)}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${rising ? "bg-tide-500/15 text-tide-400" : "bg-amber-400/15 text-amber-300"}`}
            >
              {rising ? "Rising" : "Falling"}
            </span>
          </div>
          <Sparkline
            values={values}
            activeIndex={hour}
            stroke="#22C58A"
            dotColor="#4ADE9C"
            label="Tide height trend"
          />
        </div>
      )}
      {isVisible(visibleMetrics, "nextTide") && (
        <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">
            {formatMetricLabel("nextTide", unitSystem)}
          </span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">
            {nextEvent
              ? `${nextEvent.type}: ${formatHour(nextEvent.hour, true)} (${formatMetricValue("tide", nextEvent.height, unitSystem)})`
              : safe(null)}
          </span>
        </div>
      )}
    </div>
  );
}

function SolunarGroupContent({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const windows = [
    ...(day.majorWindows ?? []).map((window) => ({
      type: "Major",
      start: window.start,
      end: window.end,
      rating: window.rating,
    })),
    ...day.minorWindows.map((window) => ({
      type: "Minor",
      start: window.start,
      end: window.end,
      rating: window.rating,
    })),
  ];
  const activeWindow =
    windows.find((window) => hour >= window.start && hour < window.end) ??
    windows.find((window) => window.start >= hour) ??
    windows[0];
  const current = day.hours[hour];

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={Moon} tint="text-indigo-300" label={formatMetricLabel("solunarRating", unitSystem)} />
      {isVisible(visibleMetrics, "solunarFeedingWindows") && (
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
            {current?.solunarRating ?? 0}
            <span className="ml-0.5 align-top text-lg font-medium text-slate-400">
              /{day.solunarRating}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-tide-500/15 px-2.5 py-1 font-body text-xs font-semibold text-tide-400">
            <Fish size={14} />
            {ratingTier(current?.solunarRating ?? 0)}
          </span>
        </div>
      )}
      {isVisible(visibleMetrics, "solunarStatus") && activeWindow && (
        <div className="mt-2 flex items-center gap-2.5 border-t border-hull-700/70 pt-2">
          <Fish size={16} className="text-slate-300" />
          <div className="leading-tight">
            <p className="font-body text-[11.5px] text-slate-500">
              Active feeding window
            </p>
            <p className="font-display text-[14px] font-semibold text-white">
              {activeWindow.type}: {formatHour(activeWindow.start, true)} -{" "}
              {formatHour(activeWindow.end, true)} [{activeWindow.rating}]
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Generic group layout (water, sun & moon, weather): plain metric tiles with icons, no nested/bordered sub-cards.
function TileGroupContent({
  group,
  visibleMetrics,
  day,
  hour,
}: {
  group: {
    id: string;
    label: string;
    metrics: Array<{ id: string; label: string }>;
  };
  visibleMetrics: VisibleMetrics;
  day: ClaudeDayData;
  hour: number;
}) {
  const unitSystem = useUnitSystem();
  const environmentalMetrics = ENVIRONMENTAL_METRICS.filter(
    (metric) => metric.group === group.id,
  );
  const metricsToShow = [
    ...group.metrics.map((metric) => ({
      ...metric,
      environmentalMetric:
        environmentalMetrics.find(
          (environmentalMetric) => environmentalMetric.id === metric.id,
        ) ?? null,
    })),
    ...environmentalMetrics
      .filter((metric) => !group.metrics.some((item) => item.id === metric.id))
      .map((metric) => ({
        id: metric.id,
        label: metric.label,
        environmentalMetric: metric,
      })),
  ].filter(
    (metric) =>
      isVisible(visibleMetrics, metric.id) &&
      (metric.environmentalMetric?.defaultVisibility.summaryCards ?? true),
  );
  const header = groupIconMap[group.id] ?? {
    icon: Fish,
    tint: "text-tide-400",
  };

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={header.icon} tint={header.tint} label={group.label} />
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3">
        {metricsToShow.map((metric) => {
          const environmentalSummary = metric.environmentalMetric
            ? day.environmentalRawSummaries?.[metric.id]
            : null;
          const [legacyValue, legacyDetail] = matrixMetricValue(
            metric.id,
            day,
            hour,
            unitSystem,
          );
          const hourlyRawValue = day.hours[hour]?.environmentalRawValues?.[metric.id];
          const hourlyValue = formatMetricValue(
            metric.id,
            hourlyRawValue,
            unitSystem,
          );
          const dailyRange = environmentalSummary
            ? formatMetricRange(metric.id, environmentalSummary.dailyRange, unitSystem)
            : "--";
          const dailyDirection = environmentalSummary
            ? formatMetricValue(metric.id, environmentalSummary.dailyDirection, unitSystem)
            : "--";
          const dailyMaximum = environmentalSummary
            ? formatMetricValue(metric.id, environmentalSummary.dailyMaximum, unitSystem)
            : "--";
          const dailyBaseline = environmentalSummary
            ? formatMetricValue(metric.id, environmentalSummary.dailyBaseline, unitSystem)
            : "--";
          const dailyDetail = !environmentalSummary || metric.id === "waveDirection"
            ? ""
            : dailyRange !== "--"
              ? dailyRange
              : dailyDirection !== "--"
                ? `Daily ${dailyDirection}`
                : dailyMaximum !== "--"
                  ? `Daily max ${dailyMaximum}`
                  : dailyBaseline !== "--"
                    ? `Daily ${dailyBaseline}`
                    : "";
          const value = metric.environmentalMetric
            ? metric.id === "waveDirection" && hourlyValue === "--"
              ? dailyDirection
              : hourlyValue
            : legacyValue;
          const detail = metric.environmentalMetric
            ? dailyDetail === "--"
              ? ""
              : dailyDetail
            : legacyDetail;
          const meta = metricIconMap[metric.id];
          const Icon = meta?.icon;
          return (
            <div key={metric.id}>
              <div className="flex items-center gap-2">
                {Icon && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-hull-700/60">
                    <Icon size={14} className={meta.tint} />
                  </div>
                )}
                <p className="min-w-0 break-words font-body text-[11.5px] leading-tight text-slate-400">
                  {formatMetricLabel(metric.id, unitSystem)}
                </p>
              </div>
              <p className={`mt-1 min-w-0 break-words font-display font-bold leading-tight tabular-nums text-white ${metric.environmentalMetric ? "text-[16px]" : "text-[21px]"}`}>
                {value}
              </p>
              {detail && (
                <p className="mt-1 truncate font-body text-[11px] text-slate-500">
                  {detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MatrixGroupCard({
  group,
  visibleMetrics,
  day,
  hour,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  group: {
    id: string;
    label: string;
    metrics: Array<{ id: string; label: string }>;
  };
  visibleMetrics: VisibleMetrics;
  day: ClaudeDayData;
  hour: number;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
}) {
  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900"
    >
      {group.id === "fishability" && (
        <FishabilityGroupContent
          day={day}
          hour={hour}
          visibleMetrics={visibleMetrics}
        />
      )}
      {group.id === "tide" && (
        <TideGroupContent
          day={day}
          hour={hour}
          visibleMetrics={visibleMetrics}
        />
      )}
      {group.id === "solunar" && (
        <SolunarGroupContent
          day={day}
          hour={hour}
          visibleMetrics={visibleMetrics}
        />
      )}
      {group.id !== "fishability" &&
        group.id !== "tide" &&
        group.id !== "solunar" && (
          <TileGroupContent
            group={group}
            visibleMetrics={visibleMetrics}
            day={day}
            hour={hour}
          />
        )}
    </article>
  );
}

// ==========================================
// DETAIL CARDS (full conditions view)
// ==========================================
function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-hull-700/70 py-1.5 first:border-t-0 first:pt-0">
      <span className="font-body text-[12.5px] text-slate-400">{label}</span>
      <span className="font-body text-[12.5px] font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

// Water & Marine: next tide peaks, slack water, water temp range, swell range/period/dir.
type VisibleMetrics = Record<string, boolean>;

function isVisible(visibleMetrics: VisibleMetrics | undefined, id: string) {
  return visibleMetrics?.[id] !== false;
}

export function WaterDetailsCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const upcomingHigh =
    day.tideEvents.find(
      (event) => event.type === "High" && event.hour >= hour,
    ) ?? day.tideEvents.find((event) => event.type === "High");
  const upcomingLow =
    day.tideEvents.find(
      (event) => event.type === "Low" && event.hour >= hour,
    ) ?? day.tideEvents.find((event) => event.type === "Low");
  const environmentalMetrics = ENVIRONMENTAL_METRICS.filter(
    (metric) =>
      metric.group === "water" && metric.defaultVisibility.fullConditions,
  );

  return (
    <article className="mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <Waves size={13} className="text-tide-400" />
        Current water &amp; marine details
      </div>
      <div className="mt-2">
        {isVisible(visibleMetrics, "currentTide") && (
          <DetailRow
            label={formatMetricLabel("tide", unitSystem)}
            value={formatMetricValue("tide", day.hours[hour]?.tideHeight, unitSystem)}
          />
        )}
        {isVisible(visibleMetrics, "currentTide") && (
          <DetailRow
            label={formatMetricLabel("tideStage", unitSystem)}
            value={safe(day.hours[hour]?.tideStage)}
          />
        )}
        {isVisible(visibleMetrics, "currentTide") && (
          <DetailRow
            label={formatMetricLabel("tideDirection", unitSystem)}
            value={safe(day.hours[hour]?.tideDirection)}
          />
        )}
        {isVisible(visibleMetrics, "nextTide") && (
          <DetailRow
            label={formatMetricLabel("nextTide", unitSystem)}
            value={
              upcomingHigh
                ? `High: ${formatHour(upcomingHigh.hour, true)} (${formatMetricValue("tide", upcomingHigh.height, unitSystem)})`
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "nextTide") && (
          <DetailRow
            label={formatMetricLabel("nextTide", unitSystem)}
            value={
              upcomingLow
                ? `Low: ${formatHour(upcomingLow.hour, true)} (${formatMetricValue("tide", upcomingLow.height, unitSystem)})`
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "nextTide") && (
          <DetailRow label="Slack water window" value={safe(null)} />
        )}
        {environmentalMetrics.map((metric) => (
          <DetailRow
            key={metric.id}
            label={formatMetricLabel(metric.id, unitSystem)}
            value={formatMetricValue(
              metric.id,
              day.hours[hour]?.environmentalRawValues?.[metric.id],
              unitSystem,
            )}
          />
        ))}
      </div>
    </article>
  );
}

// Astronomical & Solunar: major/minor windows, current status/trend, moon + sun times.
export function SolunarDetailsCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const status = solunarStatusTrend(day, hour);
  const moon = day.secondary?.moon;

  return (
    <article className="mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <Moon size={13} className="text-indigo-300" />
        Current astronomical details
      </div>
      <div className="mt-2">
        {isVisible(visibleMetrics, "solunarStatus") && (
          <DetailRow label={formatMetricLabel("solunarStatus", unitSystem)} value={status} />
        )}
        {isVisible(visibleMetrics, "solunarStatus") && (
          <DetailRow
            label={formatMetricLabel("solunarCondition", unitSystem)}
            value={safe(day.hours[hour]?.solunarCondition)}
          />
        )}
        {isVisible(visibleMetrics, "solunarFeedingWindows") && (
          <DetailRow
            label={formatMetricLabel("solunarRating", unitSystem)}
            value={safe(day.hours[hour]?.solunarRating)}
          />
        )}
        {isVisible(visibleMetrics, "solunarFeedingWindows") &&
          day.majorWindows.map((window, index) => (
            <DetailRow
              key={`major-${index}`}
              label={`${formatMetricLabel("solunarFeedingWindows", unitSystem)} ${index + 1} (Major)`}
              value={`${formatHour(window.start, true)} - ${formatHour(window.end, true)} [${window.rating}]`}
            />
          ))}
        {isVisible(visibleMetrics, "solunarFeedingWindows") &&
          day.minorWindows.map((window, index) => (
            <DetailRow
              key={index}
              label={`${formatMetricLabel("solunarFeedingWindows", unitSystem)} ${index + 1} (Minor)`}
              value={`${formatHour(window.start, true)} - ${formatHour(window.end, true)} [${window.rating}]`}
            />
          ))}
        {isVisible(visibleMetrics, "moon") && (
          <DetailRow label={formatMetricLabel("moonPhase", unitSystem)} value={safe(moon?.phaseName, "N/A")} />
        )}
        {isVisible(visibleMetrics, "moon") && (
          <DetailRow
            label={formatMetricLabel("moonIllumination", unitSystem)}
            value={moon?.illum !== undefined ? `${moon.illum}%` : safe(null)}
          />
        )}
        {isVisible(visibleMetrics, "moon") && (
          <DetailRow
            label={formatMetricLabel("moonrise", unitSystem)}
            value={
              moon
                ? `${formatOptionalHour(moon.moonrise, true)} / ${formatOptionalHour(moon.moonset, true)}`
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "sunrise") && (
          <DetailRow
            label={formatMetricLabel("sunrise", unitSystem)}
            value={
              day.sun
                ? `${formatHour(day.sun.sunrise, true)} / ${formatHour(day.sun.sunset, true)}`
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "firstLight") && (
          <DetailRow
            label={formatMetricLabel("firstLight", unitSystem)}
            value={
              day.sun
                ? `${formatOptionalHour(day.sun.firstLight, true)} / ${formatOptionalHour(day.sun.lastLight, true)}`
                : safe(null)
            }
          />
        )}
      </div>
    </article>
  );
}

// Weather: air temp range + feels, wind + gust, rain, cloud, UV.
export function WeatherDetailsCard({
  day,
  hour,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const environmentalMetrics = ENVIRONMENTAL_METRICS.filter(
    (metric) =>
      metric.group === "weather" && metric.defaultVisibility.fullConditions,
  );

  return (
    <article className="mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <Cloud size={13} className="text-sky-300" />
        Weather &amp; atmospheric conditions
      </div>
      <div className="mt-2">
        {isVisible(visibleMetrics, "airTemperature") && (
          <DetailRow
            label={formatMetricLabel("airTemperature", unitSystem)}
            value={formatMetricValue("airTemperature", day.hours[hour]?.airTemp, unitSystem)}
          />
        )}
        {isVisible(visibleMetrics, "feelsLike") && (
          <DetailRow
            label={formatMetricLabel("feelsLike", unitSystem)}
            value={
              day.hours[hour]
                ? formatMetricValue("feelsLike", day.hours[hour].feelsLike, unitSystem)
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "wind") && (
          <DetailRow
            label={formatMetricLabel("wind", unitSystem)}
            value={
              day.hours[hour]
                ? formatMetricValue("wind", day.hours[hour].wind.speed, unitSystem)
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "wind") && (
          <DetailRow
            label={formatMetricLabel("windDirection", unitSystem)}
            value={
              day.hours[hour]
                ? `${safe(day.hours[hour].wind.dir)}`
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "gust") && (
          <DetailRow
            label={formatMetricLabel("gust", unitSystem)}
            value={
              day.hours[hour]
                ? formatMetricValue("gust", day.hours[hour].wind.gust, unitSystem)
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "rainChance") && (
          <DetailRow
            label={formatMetricLabel("rainChance", unitSystem)}
            value={
              day.hours[hour]
                ? formatMetricValue("rainChance", day.hours[hour].rainChance, unitSystem)
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "rainVolume") && (
          <DetailRow
            label={formatMetricLabel("rainVolume", unitSystem)}
            value={
              day.hours[hour]
                ? formatMetricValue("rainVolume", day.hours[hour].rainVolume, unitSystem)
                : safe(null)
            }
          />
        )}
        {isVisible(visibleMetrics, "uv") && (
          <DetailRow
            label={formatMetricLabel("uv", unitSystem)}
            value={formatMetricValue("uv", day.hours[hour]?.uvIndex, unitSystem)}
          />
        )}
        {environmentalMetrics.map((metric) => (
          <DetailRow
            key={metric.id}
            label={formatMetricLabel(metric.id, unitSystem)}
            value={formatMetricValue(
              metric.id,
              day.hours[hour]?.environmentalRawValues?.[metric.id],
              unitSystem,
            )}
          />
        ))}
      </div>
    </article>
  );
}

export function DailySummaryCard({
  day,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  visibleMetrics?: VisibleMetrics;
}) {
  const unitSystem = useUnitSystem();
  const airTempRange = day.ranges?.airTemp;
  const windRange = day.ranges?.wind;
  const rain = day.secondary.rain;
  const dailyEnvironmentalMetrics = ENVIRONMENTAL_METRICS.filter(
    (metric) =>
      metric.defaultVisibility.fullConditions &&
      metric.dailyKeys &&
      (metric.dailyFullConditionsSection ?? "Daily summary") ===
      "Daily summary",
  );
  const weatherEnvironmentalMetrics = dailyEnvironmentalMetrics.filter(
    (metric) => metric.group === "weather",
  );
  const waterEnvironmentalMetrics = dailyEnvironmentalMetrics.filter(
    (metric) => metric.group === "water",
  );

  return (
    <article className="mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <CalendarDays size={13} className="text-emerald-300" />
        Daily summary
      </div>
      <div className="mt-2">
        {weatherEnvironmentalMetrics.length > 0 && (
          <p className="mb-1 font-body text-[11px] font-semibold text-slate-500">
            Weather &amp; atmospheric conditions
          </p>
        )}
        {isVisible(visibleMetrics, "airTemperature") && (
          <DetailRow
            label={formatMetricLabel("airTemperature", unitSystem)}
            value={formatMetricRange("airTemperature", airTempRange, unitSystem)}
          />
        )}
        {isVisible(visibleMetrics, "wind") && (
          <DetailRow
            label={formatMetricLabel("wind", unitSystem)}
            value={formatMetricRange(
              "wind",
              windRange ? { min: windRange.min, max: windRange.max } : null,
              unitSystem,
            )}
          />
        )}
        {isVisible(visibleMetrics, "gust") && (
          <DetailRow
            label={formatMetricLabel("gust", unitSystem)}
            value={formatMetricValue("gust", windRange?.maxGust, unitSystem)}
          />
        )}
        {isVisible(visibleMetrics, "rainChance") && (
          <DetailRow
            label={formatMetricLabel("rainChance", unitSystem)}
            value={formatMetricValue("rainChance", rain.chance, unitSystem)}
          />
        )}
        {isVisible(visibleMetrics, "rainVolume") && (
          <DetailRow
            label={formatMetricLabel("rainVolume", unitSystem)}
            value={formatMetricValue("rainVolume", rain.mm, unitSystem)}
          />
        )}
        {isVisible(visibleMetrics, "uv") && (
          <DetailRow label={formatMetricLabel("uv", unitSystem)} value={formatMetricValue("uv", day.ranges?.uvPeak, unitSystem)} />
        )}
        {isVisible(visibleMetrics, "solunarFeedingWindows") && (
          <DetailRow label={formatMetricLabel("solunarRating", unitSystem)} value={safe(day.solunarRating)} />
        )}
        {isVisible(visibleMetrics, "hourlyScore") && (
          <DetailRow label={formatMetricLabel("hourlyScore", unitSystem)} value={safe(day.dayScore)} />
        )}
        {weatherEnvironmentalMetrics.map((metric) => {
          const summary = day.environmentalRawSummaries?.[metric.id];
          const dailyRange = summary
            ? formatMetricRange(metric.id, summary.dailyRange, unitSystem)
            : "--";
          const dailyBaseline = summary
            ? formatMetricValue(metric.id, summary.dailyBaseline, unitSystem)
            : "--";
          const dailyMaximum = summary
            ? formatMetricValue(metric.id, summary.dailyMaximum, unitSystem)
            : "--";
          const dailyDirection = summary
            ? formatMetricValue(metric.id, summary.dailyDirection, unitSystem)
            : "--";
          const value = dailyRange !== "--"
            ? dailyRange
            : dailyDirection !== "--"
              ? dailyDirection
              : dailyMaximum !== "--"
                ? dailyMaximum
                : dailyBaseline;
          return <DetailRow key={metric.id} label={formatMetricLabel(metric.id, unitSystem)} value={value} />;
        })}
        {waterEnvironmentalMetrics.length > 0 && (
          <p className="mb-1 mt-3 border-t border-hull-700/70 pt-2 font-body text-[11px] font-semibold text-slate-500">
            Water &amp; marine conditions
          </p>
        )}
        {waterEnvironmentalMetrics.map((metric) => {
          const summary = day.environmentalRawSummaries?.[metric.id];
          const dailyRange = summary
            ? formatMetricRange(metric.id, summary.dailyRange, unitSystem)
            : "--";
          const dailyBaseline = summary
            ? formatMetricValue(metric.id, summary.dailyBaseline, unitSystem)
            : "--";
          const dailyMaximum = summary
            ? formatMetricValue(metric.id, summary.dailyMaximum, unitSystem)
            : "--";
          const dailyDirection = summary
            ? formatMetricValue(metric.id, summary.dailyDirection, unitSystem)
            : "--";
          const value = dailyRange !== "--"
            ? dailyRange
            : dailyDirection !== "--"
              ? dailyDirection
              : dailyMaximum !== "--"
                ? dailyMaximum
                : dailyBaseline;
          return <DetailRow key={metric.id} label={formatMetricLabel(metric.id, unitSystem)} value={value} />;
        })}
      </div>
    </article>
  );
}

// ==========================================
// FULL CONDITIONS VIEW & DAY DRAWER
// ==========================================
export function FullConditionsView({
  day,
  hour,
  onClose,
  visibleMetrics,
}: {
  day: ClaudeDayData;
  hour: number;
  onClose: () => void;
  visibleMetrics?: VisibleMetrics;
}) {
  return (
    <div className="mx-auto w-full bg-hull-950 px-4 pb-32 pt-4">
      <div className="mx-auto flex items-center justify-between">
        <div>
          {/* <p className="font-body text-[11px] uppercase tracking-wide text-slate-500">
            Daily details
          </p> */}
          <h2 className="font-display text-xl font-semibold text-white">
            All Conditions List
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Full Conditions"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 md:hidden"
        >
          Done
        </button>
      </div>
      <div className="mx-auto mt-3 space-y-2">
        <DailySummaryCard
          day={day}
          visibleMetrics={visibleMetrics}
        />
        <WaterDetailsCard
          day={day}
          hour={hour}
          visibleMetrics={visibleMetrics}
        />
        <SolunarDetailsCard
          day={day}
          hour={hour}
          visibleMetrics={visibleMetrics}
        />
        <WeatherDetailsCard
          day={day}
          hour={hour}
          visibleMetrics={visibleMetrics}
        />
      </div>
    </div>
  );
}

export function DayDrawer({
  open,
  day,
  selectedHour,
  hourlySettings,
  onClose,
  onPickHour,
  dockPosition,
  isDragging = false,
  expansionProgress = 0,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  open: boolean;
  day: ClaudeDayData;
  selectedHour: number;
  hourlySettings?: Record<string, boolean>;
  onClose: () => void;
  onPickHour: (hour: number) => void;
  dockPosition?: "bottom" | "top";
  isDragging?: boolean;
  expansionProgress?: number;
  onDragStart?: (startY: number) => void;
  onDragMove?: (currentY: number) => void;
  onDragEnd?: () => void;
}) {
  const unitSystem = useUnitSystem();
  const isTopDock = dockPosition === "top";
  const drawerVisible = open || isDragging || expansionProgress > 0;
  const viewportHeight =
    typeof window === "undefined" ? 812 : window.innerHeight;
  const drawerTravel = Math.max(0, viewportHeight - 72 - 132);
  const show = (id: string) => hourlySettings?.[id] !== false;
  const environmentalColumns = ENVIRONMENTAL_METRICS.filter(
    (metric) =>
      metric.hourlyColumnAvailable ?? metric.defaultVisibility.hourlyGrid,
  )
    .filter((metric) => metric.id !== "pressure" && metric.id !== "cloud")
    .filter(
      (metric) =>
        !metric.hourlyColumnToggleable ||
        show(metric.hourlySettingId ?? metric.id),
    );
  const marineColumns = environmentalColumns.filter(
    (metric) => metric.group === "water",
  );
  const weatherColumns = environmentalColumns.filter(
    (metric) => metric.group === "weather",
  );
  const solunarColumnCount =
    Number(show("solunarActive")) + Number(show("solunarRating"));
  const weatherColumnCount =
    [
      "wind",
      "gust",
      "pressure",
      "airTemperature",
      "feelsLike",
      "cloud",
      "rainChance",
      "rainVolume",
      "uv",
    ].filter(show).length + weatherColumns.length;
  const weatherColumnIds = [
    "wind",
    "gust",
    "pressure",
    "airTemperature",
    "feelsLike",
    "cloud",
    "rainChance",
    "rainVolume",
    "uv",
    ...weatherColumns.map((metric) => metric.id),
  ].filter(show);
  const getWeatherColumnBorderClass = (metricId: string) =>
    `border-r border-hull-700/70 ${weatherColumnIds[0] === metricId ? "border-l-2 border-l-hull-600" : ""} ${weatherColumnIds.at(-1) === metricId ? "border-r-2 border-r-hull-600" : ""}`;
  const tableScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tableRowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const selectedHourRef = useRef(selectedHour);
  const wasDrawerOpenRef = useRef(false);
  const shouldScrollSelectedHourRef = useRef(false);

  const scrollSelectedHourToCenter = () => {
    const scrollContainer = tableScrollContainerRef.current;
    const selectedRow = tableRowRefs.current[selectedHourRef.current];
    if (!scrollContainer || !selectedRow) return;

    const containerBounds = scrollContainer.getBoundingClientRect();
    const rowBounds = selectedRow.getBoundingClientRect();
    const targetScrollTop =
      scrollContainer.scrollTop +
      rowBounds.top -
      containerBounds.top -
      (scrollContainer.clientHeight - selectedRow.clientHeight) / 2;

    scrollContainer.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    selectedHourRef.current = selectedHour;
    const hasJustOpened = open && !wasDrawerOpenRef.current;
    wasDrawerOpenRef.current = open;

    if (!open) {
      shouldScrollSelectedHourRef.current = true;
      return;
    }

    if (hasJustOpened || isDragging) {
      shouldScrollSelectedHourRef.current = true;
      return;
    }

    shouldScrollSelectedHourRef.current = false;
    scrollSelectedHourToCenter();
  }, [day.date, isDragging, open, selectedHour]);

  return (
    <>
      {/* Full-screen backdrop sitting behind the constrained container */}
      <button
        type="button"
        aria-label="Close full day view"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      {/* Fixed positioning & max-width container */}
      <div
        className={`fixed inset-x-0 z-50 mx-auto w-full max-w-screen-2xl px-0 sm:px-4 lg:px-16 pointer-events-none ${isTopDock ? "top-[204px]" : "bottom-[132px]"
          }`}
      >
        {/* Drawer panel (restores pointer events and respects container width) */}
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Full day forecast"
          onTransitionEnd={(event) => {
            if (
              event.target !== event.currentTarget ||
              event.propertyName !== "height" ||
              !open ||
              !shouldScrollSelectedHourRef.current
            ) {
              return;
            }
            shouldScrollSelectedHourRef.current = false;
            scrollSelectedHourToCenter();
          }}
          className={`pointer-events-auto relative flex w-full flex-col overflow-hidden border-hull-700 bg-hull-900 ${isDragging ? "" : "transition-[height] duration-300 ease-out"
            } ${isTopDock ? "rounded-b-3xl border-b" : "rounded-t-3xl border-t"}`}
          style={{ height: `${expansionProgress * drawerTravel}px` }}
        >
          <div
            className={`flex shrink-0 items-center justify-between px-5 pb-2 pt-3 ${isTopDock ? "order-first" : ""}`}
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Full day forecast
              </h2>
              <p className="font-body text-[12.5px] text-slate-500">
                Tap a row to jump there
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close full day view"
              className="flex h-12 w-12 items-center justify-center text-slate-400"
            >
              <X size={22} />
            </button>
          </div>

          <div
            ref={tableScrollContainerRef}
            className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain px-5 pb-4"
          >
            <table className="min-w-[880px] w-full border-separate border-spacing-0 border-4 border-hull-600">
              <thead className="sticky top-0 z-10 bg-hull-900">
                <tr className="border-x-2 border-t-2 border-b-2 border-hull-600 bg-hull-800 text-center align-top font-body text-[10px] font-semibold uppercase text-slate-300">
                  <th
                    scope="col"
                    rowSpan={2}
                    className="border-x-2 border-hull-600 px-2 py-2 text-center align-top font-semibold"
                  >
                    Time
                  </th>
                  {show("hourlyScore") && (
                    <th scope="colgroup" colSpan={1} className="border-x-2 border-hull-600 px-2 py-2 text-center align-top">
                      Fishability
                    </th>
                  )}
                  {show("tide") && (
                    <th scope="colgroup" colSpan={2} className="border-x-2 border-hull-600 px-2 py-2 text-center align-top">
                      Tide
                    </th>
                  )}
                  {solunarColumnCount > 0 && (
                    <th
                      scope="colgroup"
                      colSpan={solunarColumnCount}
                      className="border-x-2 border-hull-600 px-2 py-2 text-center align-top"
                    >
                      Solunar
                    </th>
                  )}
                  {marineColumns.length > 0 && (
                    <th
                      scope="colgroup"
                      colSpan={marineColumns.length}
                      className="border-x-2 border-hull-600 px-2 py-2 text-center align-top"
                    >
                      {marineColumns[0].groupLabel}
                    </th>
                  )}
                  {weatherColumnCount > 0 && (
                    <th
                      scope="colgroup"
                      colSpan={weatherColumnCount}
                      className="border-x-2 border-hull-600 px-2 py-2 text-center align-top"
                    >
                      {weatherColumns[0].groupLabel}
                    </th>
                  )}
                </tr>
                <tr className="border-x-2 border-b-4 border-hull-600 bg-hull-700/70 text-center align-top font-body text-[11px] uppercase text-slate-300">
                  {show("hourlyScore") && (
                    <th scope="col" className="border-x-2 border-hull-600 px-2 py-2 text-center align-top font-semibold">
                      {formatMetricLabel("hourlyScore", unitSystem, true)}
                    </th>
                  )}
                  {show("tide") && (
                    <th scope="col" className="border-l-2 border-l-hull-600 border-r border-r-hull-700/70 px-2 py-2 text-center align-top font-semibold">
                      {formatMetricLabel("tide", unitSystem, true)}
                    </th>
                  )}
                  {show("tide") && (
                    <th scope="col" className="border-r-2 border-r-hull-600 px-2 py-2 text-center align-top font-semibold">
                      {formatMetricLabel("tideDirection", unitSystem, true)}
                    </th>
                  )}
                  {show("solunarActive") && (
                    <th scope="col" className={`border-r border-hull-700/70 px-2 py-2 text-center align-top font-semibold ${show("solunarRating") ? "border-l-2 border-l-hull-600" : "border-x-2 border-x-hull-600"}`}>
                      {formatMetricLabel("solunarActive", unitSystem, true)}
                    </th>
                  )}
                  {show("solunarRating") && (
                    <th scope="col" className={`border-r-2 border-r-hull-600 px-2 py-2 text-center align-top font-semibold ${show("solunarActive") ? "" : "border-l-2 border-l-hull-600"}`}>
                      {formatMetricLabel("solunarRating", unitSystem, true)}
                    </th>
                  )}
                  {marineColumns.map((metric, columnIndex) => (
                    <th
                      key={metric.id}
                      scope="col"
                      className={`border-r border-hull-700/70 px-2 py-2 text-center align-top font-semibold ${columnIndex === 0 ? "border-l-2 border-l-hull-600" : ""} ${columnIndex === marineColumns.length - 1 ? "border-r-2 border-r-hull-600" : ""}`}
                    >
                      {formatMetricLabel(metric.id, unitSystem, true)}
                    </th>
                  ))}
                  {show("wind") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("wind")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("wind", unitSystem, true)}
                    </th>
                  )}
                  {show("gust") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("gust")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("gust", unitSystem, true)}
                    </th>
                  )}
                  {show("pressure") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("pressure")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("pressure", unitSystem, true)}
                    </th>
                  )}
                  {show("airTemperature") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("airTemperature")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("airTemperature", unitSystem, true)}
                    </th>
                  )}
                  {show("feelsLike") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("feelsLike")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("feelsLike", unitSystem, true)}
                    </th>
                  )}
                  {show("cloud") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("cloud")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("cloud", unitSystem, true)}
                    </th>
                  )}
                  {show("rainChance") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("rainChance")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("rainChance", unitSystem, true)}
                    </th>
                  )}
                  {show("rainVolume") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("rainVolume")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("rainVolume", unitSystem, true)}
                    </th>
                  )}
                  {show("uv") && (
                    <th scope="col" className={`${getWeatherColumnBorderClass("uv")} px-2 py-2 text-center align-top font-semibold`}>
                      {formatMetricLabel("uv", unitSystem, true)}
                    </th>
                  )}
                  {weatherColumns.map((metric) => (
                    <th
                      key={metric.id}
                      scope="col"
                      className={`${getWeatherColumnBorderClass(metric.id)} px-2 py-2 text-center align-top font-semibold`}
                    >
                      {formatMetricLabel(metric.id, unitSystem, true)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_td]:align-top [&_td]:text-left [&_th]:align-top [&_th]:text-left">
                {day.hours.map((item) => {
                  const activate = () => {
                    onPickHour(item.hour);
                    onClose();
                  };
                  return (
                    <tr
                      key={item.hour}
                      ref={(element) => {
                        tableRowRefs.current[item.hour] = element;
                      }}
                      role="button"
                      tabIndex={0}
                      onClick={activate}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          activate();
                        }
                      }}
                      className={`min-h-[48px] cursor-pointer border-b border-hull-700/50 text-left ${item.hour === selectedHour ? "bg-tide-500/10" : ""
                        }`}
                    >
                      <th
                        scope="row"
                        className={`border-x-2 border-hull-600 px-3 py-3 text-left font-body text-[13px] font-semibold tabular-nums ${item.hour === selectedHour ? "text-tide-400" : "text-white"}`}
                      >
                        {formatHour(item.hour)}
                      </th>
                      {show("hourlyScore") && (
                        <td className="border-x-2 border-hull-600 px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300">
                          {safe(item.score)}
                        </td>
                      )}
                      {show("tide") && (
                        <td className="border-l-2 border-l-hull-600 border-r border-r-hull-700/70 px-3 py-3 font-body text-[13px] tabular-nums text-slate-300">
                          {formatMetricValue("tide", item.tideHeight, unitSystem)}
                        </td>
                      )}
                      {show("tide") && (
                        <td className="border-r-2 border-r-hull-600 px-3 py-3 font-body text-[12.5px] text-slate-400">
                          {safe(item.tideDirection, "N/A")}
                        </td>
                      )}
                      {show("solunarActive") && (
                        <td className={`border-r border-hull-700/70 px-3 py-3 font-body text-[12.5px] text-slate-400 ${show("solunarRating") ? "border-l-2 border-l-hull-600" : "border-x-2 border-x-hull-600"}`}>
                          {item.solunar === "none"
                            ? "Neutral"
                            : item.solunar === "major"
                              ? "Major"
                              : "Minor"}
                        </td>
                      )}
                      {show("solunarRating") && (
                        <td className={`border-r-2 border-r-hull-600 px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300 ${show("solunarActive") ? "" : "border-l-2 border-l-hull-600"}`}>
                          {safe(item.solunarRating)}
                        </td>
                      )}
                      {marineColumns.map((metric, columnIndex) => (
                        <td
                          key={metric.id}
                          className={`border-r border-hull-700/70 px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300 ${columnIndex === 0 ? "border-l-2 border-l-hull-600" : ""} ${columnIndex === marineColumns.length - 1 ? "border-r-2 border-r-hull-600" : ""}`}
                        >
                          {formatMetricValue(metric.id, item.environmentalRawValues?.[metric.id], unitSystem)}
                        </td>
                      ))}
                      {show("wind") && (
                        <td className={`${getWeatherColumnBorderClass("wind")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("wind", item.wind?.speed, unitSystem)} {safe(item.wind?.dir, "")}
                        </td>
                      )}
                      {show("gust") && (
                        <td className={`${getWeatherColumnBorderClass("gust")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("gust", item.wind?.gust, unitSystem)}
                        </td>
                      )}
                      {show("pressure") && (
                        <td className={`${getWeatherColumnBorderClass("pressure")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("pressure", item.pressure, unitSystem)}
                        </td>
                      )}
                      {show("airTemperature") && (
                        <td className={`${getWeatherColumnBorderClass("airTemperature")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("airTemperature", item.airTemp, unitSystem)}
                        </td>
                      )}
                      {show("feelsLike") && (
                        <td className={`${getWeatherColumnBorderClass("feelsLike")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("feelsLike", item.feelsLike, unitSystem)}
                        </td>
                      )}
                      {show("cloud") && (
                        <td className={`${getWeatherColumnBorderClass("cloud")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("cloud", item.cloudCover, unitSystem)}
                        </td>
                      )}
                      {show("rainChance") && (
                        <td className={`${getWeatherColumnBorderClass("rainChance")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("rainChance", item.rainChance, unitSystem)}
                        </td>
                      )}
                      {show("rainVolume") && (
                        <td className={`${getWeatherColumnBorderClass("rainVolume")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("rainVolume", item.rainVolume, unitSystem)}
                        </td>
                      )}
                      {show("uv") && (
                        <td className={`${getWeatherColumnBorderClass("uv")} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}>
                          {formatMetricValue("uv", item.uvIndex, unitSystem, true, "N/A")}
                        </td>
                      )}
                      {weatherColumns.map((metric) => (
                        <td
                          key={metric.id}
                          className={`${getWeatherColumnBorderClass(metric.id)} px-3 py-3 font-body text-[12.5px] tabular-nums text-slate-300`}
                        >
                          {formatMetricValue(metric.id, item.environmentalRawValues?.[metric.id], unitSystem)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {onDragStart && onDragMove && onDragEnd && (
            <div
              className={`flex h-8 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing ${isTopDock
                ? "order-last border-t border-hull-700/60"
                : "order-first border-b border-hull-700/60"
                }`}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                onDragStart(event.clientY);
              }}
              onPointerMove={(event) => onDragMove(event.clientY)}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              aria-label={
                isTopDock
                  ? "Slide the full day forecast back up"
                  : "Slide the full day forecast back down"
              }
            >
              <div className="h-1 w-10 rounded-full bg-hull-600/90" />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
