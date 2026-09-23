import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  Fish,
  Gauge,
  Moon,
  Sun,
  Thermometer,
  Waves,
  Wind,
  X
} from "lucide-react";
import type { ClaudeDayData } from "../../data/conditions";
import type { AnchoredSettingsState } from "../../hooks/useAnchoredSettings";
import type { PrototypeId } from "../../hooks/useLayoutPrototype";

export interface DashboardStateProps {
  day: ClaudeDayData;
  hour: number;
  offset: number;
  onHourChange: (hour: number) => void;
  onOffsetChange: (offset: number) => void;
  prototype: PrototypeId;
  onSelectPrototype: (id: PrototypeId) => void;
}

// Fixture "today" used by the mock data generator - not the real device date.
export const BASE_DATE = new Date(2026, 8, 21);
export const DEFAULT_HOUR = 7;

export type MetricKey = keyof AnchoredSettingsState;

export const metrics: Array<{ id: MetricKey; label: string; icon: typeof Wind; tint: string; ring: string }> = [
  { id: "wind", label: "Wind", icon: Wind, tint: "text-sky-300", ring: "bg-sky-400/10" },
  { id: "waterTemp", label: "Water temp", icon: Thermometer, tint: "text-orange-300", ring: "bg-orange-400/10" },
  { id: "swell", label: "Swell", icon: Waves, tint: "text-cyan-300", ring: "bg-cyan-400/10" },
  { id: "moonPhase", label: "Moon phase", icon: Moon, tint: "text-indigo-300", ring: "bg-indigo-400/10" },
  { id: "rain", label: "Rain", icon: CloudRain, tint: "text-blue-300", ring: "bg-blue-400/10" },
  { id: "uv", label: "UV index", icon: Sun, tint: "text-yellow-300", ring: "bg-yellow-400/10" },
  { id: "airTemp", label: "Air temp", icon: Cloud, tint: "text-emerald-200", ring: "bg-emerald-400/10" }
];

export function formatHour(hour: number, minutes = false) {
  const wholeHour = Math.floor(hour);
  const display = wholeHour % 12 || 12;
  return `${display}${minutes ? `:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}` : ""} ${wholeHour >= 12 ? "PM" : "AM"}`;
}

export function formatOptionalHour(hour: number | null | undefined, minutes = false) {
  return hour == null ? "--" : formatHour(hour, minutes);
}

export function formatDate(offset: number) {
  const date = new Date(BASE_DATE);
  date.setDate(BASE_DATE.getDate() + offset);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-AU", { month: "short" });
  const weekday = date.toLocaleDateString("en-AU", { weekday: "short" });
  if (offset === 0) return `Today, ${day} ${month}`;
  if (offset === 1) return `Tomorrow, ${day} ${month}`;
  if (offset === -1) return `Yesterday, ${day} ${month}`;
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
  if (band === "Peak" || band === "Strong") return { text: "text-tide-400", chip: "bg-tide-500/15 text-tide-400", stroke: "#4ADE9C" };
  if (band === "Favorable") return { text: "text-amber-300", chip: "bg-amber-400/15 text-amber-300", stroke: "#FCD34D" };
  return { text: "text-slate-300", chip: "bg-hull-700 text-slate-300", stroke: "#94A3B8" };
}

// Renders a placeholder when mock data for a metric is missing/unavailable (AC3).
export function safe<T>(value: T | null | undefined, fallback = "--"): T | string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isNaN(value)) return fallback;
  return value;
}

export function solunarStatusTrend(day: ClaudeDayData, hour: number): string {
  const windows = [
    ...(day.majorWindows ?? []).map(window => ({ type: "Major", start: window.start, end: window.end })),
    ...(day.minorWindows ?? []).map(window => ({ type: "Minor", start: window.start, end: window.end }))
  ];

  for (const window of windows) {
    if (window.start === undefined || window.end === undefined) continue;
    if (hour >= window.start && hour <= window.end) return `Peak (${window.type})`;
    if (hour >= window.start - 0.75 && hour < window.start) return `Building (${window.type})`;
    if (hour > window.end && hour <= window.end + 0.75) return `Fading (${window.type})`;
  }
  return "Neutral";
}

export function getMetricDisplay(id: MetricKey, day: ClaudeDayData, hour: number): [string, string, string] {
  const wind = day.hours[hour].wind;
  const swell = day.secondary.swell;
  const uv = day.secondary.uv;
  const data: Record<MetricKey, [string, string, string]> = {
    wind: [`${wind.speed}`, "kts", `${wind.dir} · Gusts ${wind.gust} kts`],
    waterTemp: [`${safe(day.secondary.waterTemp)}`, "°C", "Surface reading"],
    swell: swell ? [swell.height, "m", `@ ${swell.period}s ${swell.dir}`] : ["--", "m", "--"],
    moonPhase: [`${safe(day.secondary.moon.illum)}`, "%", `${safe(day.secondary.moon.phaseName)}`],
    rain: [`${safe(day.secondary.rain.chance)}`, "%", day.secondary.rain.mm == null ? "--" : `${day.secondary.rain.mm.toFixed(1)}mm chance`],
    uv: [`${safe(uv)}`, "", uv == null ? "--" : uvLabel(uv)],
    airTemp: [`${day.secondary.airTemp.temp}`, "°C", `Feels ${day.secondary.airTemp.feels}°C`]
  };
  return data[id];
}

export function StepButton({
  label,
  direction,
  disabled = false,
  onClick
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
    pillRefs.current[hour]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [hour]);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {day.hours.map(({ hour: value }) => (
        <button
          key={value}
          ref={element => { pillRefs.current[value] = element; }}
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

export function Sparkline({ values, activeIndex, stroke, dotColor, label, height = 46, width = 280 }: SparklineProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * width},${height - ((value - min) / (max - min || 1)) * height}`)
    .join(" ");
  const activeX = (activeIndex / (values.length - 1)) * width;
  const activeY = height - ((values[activeIndex] - min) / (max - min || 1)) * height;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 flex-1" preserveAspectRatio="none" aria-label={label}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
      <circle cx={activeX} cy={activeY} r="4.5" fill={dotColor ?? stroke} stroke="#070B13" strokeWidth="2" />
    </svg>
  );
}

export function ScoreCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const values = day.hours.map(item => item.score);
  const current = day.hours[hour];
  const tone = scoreBandTone(current.scoreBand);
  const nextPeak = day.hours.find(item => item.hour > hour && (item.scoreBand === "Peak" || item.scoreBand === "Strong"));

  return (
    <article className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Fish size={13} className={tone.text} />
          Fishing score
        </div>
        {isVisible(visibleMetrics, "hourlyScore") && <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">{current.score}</span>
            <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${tone.chip}`}>{current.scoreBand}</span>
          </div>
          <Sparkline values={values} activeIndex={hour} stroke={tone.stroke} label="Fishing score trend" />
        </div>}
        {isVisible(visibleMetrics, "feedingWindows") && <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">{nextPeak ? "Next strong window" : "Based on tide + solunar"}</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextPeak ? `${formatHour(nextPeak.hour)} (${nextPeak.score})` : "No stronger window today"}</span>
        </div>}
      </div>
    </article>
  );
}

export function TideCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const values = day.hours.map(item => item.tideHeight);
  const current = day.hours[hour];
  const nextEvent = day.tideEvents.find(event => event.hour >= hour) ?? day.tideEvents[0];
  const rising = day.hours[Math.min(23, hour + 1)].tideHeight > current.tideHeight;

  return (
    <article className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Waves size={13} className="text-tide-400" />
          Tide height
        </div>
        {isVisible(visibleMetrics, "currentTide") && <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
              {current.tideHeight.toFixed(1)}
              <span className="ml-0.5 align-top text-xl font-medium text-slate-400">m</span>
            </span>
            <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${rising ? "bg-tide-500/15 text-tide-400" : "bg-amber-400/15 text-amber-300"}`}>
              {rising ? "Rising" : "Falling"}
            </span>
          </div>
          <Sparkline values={values} activeIndex={hour} stroke="#22C58A" dotColor="#4ADE9C" label="Tide height trend" />
        </div>}
        {isVisible(visibleMetrics, "nextTide") && <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">Next {nextEvent.type.toLowerCase()} tide</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextEvent.type}: {formatHour(nextEvent.hour, true)} ({nextEvent.height.toFixed(1)}m)</span>
        </div>}
      </div>
    </article>
  );
}

export function SolunarCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const windows = [
    ...(day.majorWindows ?? []).map(window => ({ type: "Major", start: window.start, end: window.end })),
    ...day.minorWindows.map(window => ({ type: "Minor", start: window.start, end: window.end }))
  ];
  const activeWindow = windows.find(window => hour >= window.start && hour < window.end)
    ?? windows.find(window => window.start >= hour)
    ?? windows[0];

  return (
    <article className="mx-4 mt-2 rounded-3xl border border-hull-700/70 bg-hull-800">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Moon size={13} className="text-indigo-300" />
          Solunar rating
        </div>
        {isVisible(visibleMetrics, "solunarFeedingWindows") && <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
            {day.solunarRating}
            <span className="ml-0.5 align-top text-lg font-medium text-slate-400">%</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-tide-500/15 px-2.5 py-1 font-body text-xs font-semibold text-tide-400">
            <Fish size={14} />
            {ratingTier(day.solunarRating)}
          </span>
        </div>}
        {isVisible(visibleMetrics, "solunarStatus") && <div className="mt-2 flex items-center gap-2.5 border-t border-hull-700/70 pt-2">
          <Fish size={16} className="text-slate-300" />
          <div className="leading-tight">
            <p className="font-body text-[11.5px] text-slate-500">Active feeding window</p>
            <p className="font-display text-[14px] font-semibold text-white">{activeWindow.type}: {formatHour(activeWindow.start, true)} - {formatHour(activeWindow.end, true)}</p>
          </div>
        </div>}
      </div>
    </article>
  );
}

export function PressureCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const current = day.hours[hour];
  const pressureRange = day.ranges?.pressure;
  const trend = day.secondary.pressure.trend;
  const trendTone = trend === "Falling" ? "text-amber-300" : trend === "Rising" ? "text-tide-400" : "text-slate-300";

  return (
    <article className="mx-4 mt-2 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
          <Gauge size={13} className="text-amber-300" />
          Atmospheric pressure
        </div>
        {isVisible(visibleMetrics, "pressure") && <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
            {safe(current?.pressure)}
            <span className="ml-1 text-lg font-medium text-slate-400">hPa</span>
          </span>
          <span className={`rounded-full bg-hull-700 px-2.5 py-1 font-body text-xs font-semibold ${trendTone}`}>
            {safe(trend, "Steady")}
          </span>
        </div>}
        {isVisible(visibleMetrics, "pressure") && <div className="mt-2 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">Today's range</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">
            {pressureRange ? `${pressureRange.min} - ${pressureRange.max} hPa` : safe(null)}
          </span>
        </div>}
      </div>
    </article>
  );
}

export function MetricCard({ id, day, hour, variant = "card" }: { id: MetricKey; day: ClaudeDayData; hour: number; variant?: "hero" | "card" }) {
  const metric = metrics.find(item => item.id === id)!;
  const Icon = metric.icon;
  const [value, unit, detail] = getMetricDisplay(id, day, hour);

  return (
    <article className={`${variant === "hero" ? "min-h-[132px] p-4" : "min-h-[92px] p-3"} flex flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800`}>
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${metric.ring}`}>
          <Icon size={14} className={metric.tint} />
        </div>
        <p className="font-body text-[11.5px] leading-tight text-slate-400">{metric.label}</p>
      </div>
      <div>
        <p className={`font-display font-bold leading-none tabular-nums text-white ${variant === "hero" ? "text-[34px]" : "text-[21px]"}`}>
          {value}
          <span className="ml-1 font-body text-[13px] font-medium text-slate-400">{unit}</span>
        </p>
        <p className="mt-1 truncate font-body text-[11px] text-slate-500">{detail}</p>
      </div>
    </article>
  );
}

function matrixMetricValue(id: string, day: ClaudeDayData, hour: number): [string, string] {
  const current = day.hours[hour];
  const nextPeak = day.hours.find(item => item.hour > hour && (item.scoreBand === "Peak" || item.scoreBand === "Strong"));
  const range = day.ranges;
  const values: Record<string, [string, string]> = {
    hourlyScore: [`${current.score} ${current.scoreBand}`, "Current score"],
    maxDayScore: [`${Math.max(...day.hours.map(item => item.score))}`, "Best hourly score"],
    feedingWindows: [nextPeak ? formatHour(nextPeak.hour) : "--", "Next strong window"],
    currentTide: [`${current.tideHeight.toFixed(1)}m`, current.tideStage],
    nextTide: [day.tideEvents[0] ? `${day.tideEvents[0].type} ${formatHour(day.tideEvents[0].hour, true)}` : "--", "Next tide"],
    waterTemperature: [String(day.secondary.waterTemp ?? "--"), range?.waterTemp ? `${range.waterTemp.min}-${range.waterTemp.max}°C` : "Unavailable"],
    swell: [day.secondary.swell?.height ?? "--", day.secondary.swell ? `${day.secondary.swell.period}s ${day.secondary.swell.dir}` : "Unavailable"],
    solunarFeedingWindows: [String(day.majorWindows.length + day.minorWindows.length), "Feeding windows"],
    solunarStatus: [solunarStatusTrend(day, hour), "Current trend"],
    moon: [`${day.secondary.moon.illum ?? "--"}%`, day.secondary.moon.phaseName ?? "Unavailable"],
    sunrise: [formatOptionalHour(day.sun.sunrise, true), `Sunset ${formatOptionalHour(day.sun.sunset, true)}`],
    firstLight: [formatOptionalHour(day.sun.firstLight, true), "First light"],
    pressure: [`${current.pressure ?? "--"}`, day.secondary.pressure.trend ?? "Steady"],
    airTemperature: [`${current.airTemp ?? "--"}°C`, range?.airTemp ? `${range.airTemp.min}-${range.airTemp.max}°C` : "Range unavailable"],
    feelsLike: [`${day.secondary.airTemp.feels ?? "--"}°C`, "Feels like"],
    wind: [`${current.wind.speed} kt`, current.wind.dir],
    gust: [`${current.wind.gust ?? "--"} kt`, "Gust speed"],
    cloud: [`${current.cloudCover ?? "--"}%`, "Cloud baseline"],
    rainChance: [`${current.rainChance ?? "--"}%`, "Rain chance"],
    rainVolume: [String(day.secondary.rain.mm ?? "--"), "Rain volume"],
    uv: [String(day.secondary.uv ?? "--"), "Peak UV"]
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
  gust: { icon: Wind, tint: "text-sky-300" },
  cloud: { icon: Cloud, tint: "text-slate-300" },
  rainChance: { icon: CloudRain, tint: "text-blue-300" },
  rainVolume: { icon: CloudRain, tint: "text-blue-300" },
  uv: { icon: Sun, tint: "text-yellow-300" }
};

const groupIconMap: Record<string, { icon: typeof Wind; tint: string }> = {
  fishability: { icon: Fish, tint: "text-tide-400" },
  tide: { icon: Waves, tint: "text-tide-400" },
  water: { icon: Waves, tint: "text-cyan-300" },
  solunar: { icon: Moon, tint: "text-indigo-300" },
  sunMoon: { icon: Moon, tint: "text-indigo-300" },
  weather: { icon: Cloud, tint: "text-sky-300" }
};

function GroupHeader({ icon: Icon, tint, label }: { icon: typeof Wind; tint: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
      <Icon size={13} className={tint} />
      {label}
    </div>
  );
}

export function MatrixMetricCard({ id, label, day, hour, hero = false, draggable = false, onDragStart, onDragOver, onDrop }: { id: string; label: string; day: ClaudeDayData; hour: number; hero?: boolean; draggable?: boolean; onDragStart?: (event: React.DragEvent<HTMLElement>) => void; onDragOver?: (event: React.DragEvent<HTMLElement>) => void; onDrop?: (event: React.DragEvent<HTMLElement>) => void }) {
  const [value, detail] = matrixMetricValue(id, day, hour);
  const meta = metricIconMap[id];
  const Icon = meta?.icon;
  return (
    <article draggable={draggable} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} className={`${hero ? "min-h-[132px] p-4" : "min-h-[92px] p-3"} flex flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800`}>
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-hull-700/60">
            <Icon size={14} className={meta.tint} />
          </div>
        )}
        <p className="font-body text-[11.5px] leading-tight text-slate-400">{label}</p>
      </div>
      <div className="mt-1">
        <p className={`${hero ? "text-[30px]" : "text-[21px]"} font-display font-bold leading-none tabular-nums text-white`}>{value}</p>
        <p className="mt-1 truncate font-body text-[11px] text-slate-500">{detail}</p>
      </div>
    </article>
  );
}

// Fishing score group: merges hourly + max-day score into a single "current/max" hero number, as it was before grouping.
function FishabilityGroupContent({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics: VisibleMetrics }) {
  const values = day.hours.map(item => item.score);
  const current = day.hours[hour];
  const tone = scoreBandTone(current.scoreBand);
  const maxScore = Math.max(...values);
  const nextPeak = day.hours.find(item => item.hour > hour && (item.scoreBand === "Peak" || item.scoreBand === "Strong"));
  const showHourly = isVisible(visibleMetrics, "hourlyScore");
  const showMax = isVisible(visibleMetrics, "maxDayScore");
  const showWindow = isVisible(visibleMetrics, "feedingWindows");

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={Fish} tint={tone.text} label="Fishing score" />
      {(showHourly || showMax) && (
        <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
              {showHourly ? current.score : maxScore}
              {showHourly && showMax && <span className="ml-0.5 align-top text-xl font-medium text-slate-400">/{maxScore}</span>}
            </span>
            <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${tone.chip}`}>{current.scoreBand}</span>
          </div>
          <Sparkline values={values} activeIndex={hour} stroke={tone.stroke} label="Fishing score trend" />
        </div>
      )}
      {showWindow && (
        <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">{nextPeak ? "Next strong window" : "Based on tide + solunar"}</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextPeak ? `${formatHour(nextPeak.hour)} (${nextPeak.score})` : "No stronger window today"}</span>
        </div>
      )}
    </div>
  );
}

function TideGroupContent({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics: VisibleMetrics }) {
  const values = day.hours.map(item => item.tideHeight);
  const current = day.hours[hour];
  const nextEvent = day.tideEvents.find(event => event.hour >= hour) ?? day.tideEvents[0];
  const rising = day.hours[Math.min(23, hour + 1)].tideHeight > current.tideHeight;

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={Waves} tint="text-tide-400" label="Tide height" />
      {isVisible(visibleMetrics, "currentTide") && (
        <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">
              {current.tideHeight.toFixed(1)}
              <span className="ml-0.5 align-top text-xl font-medium text-slate-400">m</span>
            </span>
            <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${rising ? "bg-tide-500/15 text-tide-400" : "bg-amber-400/15 text-amber-300"}`}>
              {rising ? "Rising" : "Falling"}
            </span>
          </div>
          <Sparkline values={values} activeIndex={hour} stroke="#22C58A" dotColor="#4ADE9C" label="Tide height trend" />
        </div>
      )}
      {isVisible(visibleMetrics, "nextTide") && (
        <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">Next {nextEvent.type.toLowerCase()} tide</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextEvent.type}: {formatHour(nextEvent.hour, true)} ({nextEvent.height.toFixed(1)}m)</span>
        </div>
      )}
    </div>
  );
}

function SolunarGroupContent({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics: VisibleMetrics }) {
  const windows = [
    ...(day.majorWindows ?? []).map(window => ({ type: "Major", start: window.start, end: window.end })),
    ...day.minorWindows.map(window => ({ type: "Minor", start: window.start, end: window.end }))
  ];
  const activeWindow = windows.find(window => hour >= window.start && hour < window.end)
    ?? windows.find(window => window.start >= hour)
    ?? windows[0];

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={Moon} tint="text-indigo-300" label="Solunar rating" />
      {isVisible(visibleMetrics, "solunarFeedingWindows") && (
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
            {day.solunarRating}
            <span className="ml-0.5 align-top text-lg font-medium text-slate-400">%</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-tide-500/15 px-2.5 py-1 font-body text-xs font-semibold text-tide-400">
            <Fish size={14} />
            {ratingTier(day.solunarRating)}
          </span>
        </div>
      )}
      {isVisible(visibleMetrics, "solunarStatus") && activeWindow && (
        <div className="mt-2 flex items-center gap-2.5 border-t border-hull-700/70 pt-2">
          <Fish size={16} className="text-slate-300" />
          <div className="leading-tight">
            <p className="font-body text-[11.5px] text-slate-500">Active feeding window</p>
            <p className="font-display text-[14px] font-semibold text-white">{activeWindow.type}: {formatHour(activeWindow.start, true)} - {formatHour(activeWindow.end, true)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Generic group layout (water, sun & moon, weather): plain metric tiles with icons, no nested/bordered sub-cards.
function TileGroupContent({ group, visibleMetrics, day, hour }: { group: { id: string; label: string; metrics: Array<{ id: string; label: string }> }; visibleMetrics: VisibleMetrics; day: ClaudeDayData; hour: number }) {
  const metricsToShow = group.metrics.filter(metric => isVisible(visibleMetrics, metric.id));
  const header = groupIconMap[group.id] ?? { icon: Fish, tint: "text-tide-400" };

  return (
    <div className="px-4 pb-3 pt-3">
      <GroupHeader icon={header.icon} tint={header.tint} label={group.label} />
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3">
        {metricsToShow.map(metric => {
          const [value, detail] = matrixMetricValue(metric.id, day, hour);
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
                <p className="font-body text-[11.5px] leading-tight text-slate-400">{metric.label}</p>
              </div>
              <p className="mt-1 font-display text-[21px] font-bold leading-none tabular-nums text-white">{value}</p>
              <p className="mt-1 truncate font-body text-[11px] text-slate-500">{detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MatrixGroupCard({ group, visibleMetrics, day, hour, draggable = false, onDragStart, onDragOver, onDrop }: { group: { id: string; label: string; metrics: Array<{ id: string; label: string }> }; visibleMetrics: VisibleMetrics; day: ClaudeDayData; hour: number; draggable?: boolean; onDragStart?: (event: React.DragEvent<HTMLElement>) => void; onDragOver?: (event: React.DragEvent<HTMLElement>) => void; onDrop?: (event: React.DragEvent<HTMLElement>) => void }) {
  return (
    <article draggable={draggable} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900">
      {group.id === "fishability" && <FishabilityGroupContent day={day} hour={hour} visibleMetrics={visibleMetrics} />}
      {group.id === "tide" && <TideGroupContent day={day} hour={hour} visibleMetrics={visibleMetrics} />}
      {group.id === "solunar" && <SolunarGroupContent day={day} hour={hour} visibleMetrics={visibleMetrics} />}
      {group.id !== "fishability" && group.id !== "tide" && group.id !== "solunar" && (
        <TileGroupContent group={group} visibleMetrics={visibleMetrics} day={day} hour={hour} />
      )}
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-hull-700/70 py-1.5 first:border-t-0 first:pt-0">
      <span className="font-body text-[12.5px] text-slate-400">{label}</span>
      <span className="font-body text-[12.5px] font-semibold tabular-nums text-white">{value}</span>
    </div>
  );
}

// Water & Marine: next tide peaks, slack water, water temp range, swell range/period/dir.
type VisibleMetrics = Record<string, boolean>;

function isVisible(visibleMetrics: VisibleMetrics | undefined, id: string) {
  return visibleMetrics?.[id] !== false;
}

export function WaterDetailsCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const upcomingHigh = day.tideEvents.find(event => event.type === "High" && event.hour >= hour) ?? day.tideEvents.find(event => event.type === "High");
  const upcomingLow = day.tideEvents.find(event => event.type === "Low" && event.hour >= hour) ?? day.tideEvents.find(event => event.type === "Low");
  const waterTempRange = day.ranges?.waterTemp;
  const swellRange = day.ranges?.swell;

  return (
    <article className="mx-4 mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <Waves size={13} className="text-tide-400" />
        Water &amp; marine details
      </div>
      <div className="mt-2">
        {isVisible(visibleMetrics, "currentTide") && <DetailRow label="Current tide height" value={`${safe(day.hours[hour]?.tideHeight)}m`} />}
        {isVisible(visibleMetrics, "currentTide") && <DetailRow label="Current tide stage" value={safe(day.hours[hour]?.tideStage)} />}
        {isVisible(visibleMetrics, "currentTide") && <DetailRow label="Current tide direction" value={safe(day.hours[hour]?.tideDirection)} />}
        {isVisible(visibleMetrics, "nextTide") && <DetailRow label="Next high tide" value={upcomingHigh ? `${formatHour(upcomingHigh.hour, true)} (${upcomingHigh.height.toFixed(1)}m)` : safe(null)} />}
        {isVisible(visibleMetrics, "nextTide") && <DetailRow label="Next low tide" value={upcomingLow ? `${formatHour(upcomingLow.hour, true)} (${upcomingLow.height.toFixed(1)}m)` : safe(null)} />}
        {isVisible(visibleMetrics, "nextTide") && <DetailRow label="Slack water window" value={safe(null)} />}
        {isVisible(visibleMetrics, "waterTemperature") && <DetailRow label="Water temperature" value={day.secondary?.waterTemp ? `${day.secondary.waterTemp}°C` : safe(null)} />}
        {isVisible(visibleMetrics, "waterTemperature") && <DetailRow label="Water temp range" value={waterTempRange ? `${safe(waterTempRange.min)}°C - ${safe(waterTempRange.max)}°C` : safe(null)} />}
        {isVisible(visibleMetrics, "swell") && <DetailRow label="Current swell" value={day.secondary?.swell ? `${day.secondary.swell.height}m @ ${day.secondary.swell.period}s ${day.secondary.swell.dir}` : safe(null)} />}
        {isVisible(visibleMetrics, "swell") && <DetailRow label="Swell range" value={swellRange ? `${safe(swellRange.min)}m - ${safe(swellRange.max)}m` : safe(null)} />}
        {isVisible(visibleMetrics, "swell") && <DetailRow label="Swell period / direction" value={swellRange ? `${safe(swellRange.period)}s ${safe(swellRange.dir)}` : safe(null)} />}
      </div>
    </article>
  );
}

// Astronomical & Solunar: major/minor windows, current status/trend, moon + sun times.
export function SolunarDetailsCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const status = solunarStatusTrend(day, hour);
  const moon = day.secondary?.moon;
  const majorWindow = day.majorWindows[0];

  return (
    <article className="mx-4 mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <Moon size={13} className="text-indigo-300" />
        Astronomical &amp; solunar details
      </div>
      <div className="mt-2">
        {isVisible(visibleMetrics, "solunarStatus") && <DetailRow label="Current solunar status" value={status} />}
        {isVisible(visibleMetrics, "solunarStatus") && <DetailRow label="Current solunar condition" value={safe(day.hours[hour]?.solunarCondition)} />}
        {isVisible(visibleMetrics, "solunarFeedingWindows") && <DetailRow label="Daily solunar rating" value={`${safe(day.solunarRating)}%`} />}
        {isVisible(visibleMetrics, "solunarFeedingWindows") && <DetailRow label="Major feeding window" value={majorWindow ? `${formatHour(majorWindow.start, true)} - ${formatHour(majorWindow.end, true)}` : safe(null)} />}
        {isVisible(visibleMetrics, "solunarFeedingWindows") && day.minorWindows.map((window, index) => (
          <DetailRow key={index} label={`Minor feeding window ${index + 1}`} value={`${formatHour(window.start, true)} - ${formatHour(window.end, true)}`} />
        ))}
        {isVisible(visibleMetrics, "moon") && <DetailRow label="Moon phase" value={safe(moon?.phaseName, "N/A")} />}
        {isVisible(visibleMetrics, "moon") && <DetailRow label="Moon illumination" value={moon?.illum !== undefined ? `${moon.illum}%` : safe(null)} />}
        {isVisible(visibleMetrics, "moon") && <DetailRow label="Moonrise / moonset" value={moon ? `${formatOptionalHour(moon.moonrise, true)} / ${formatOptionalHour(moon.moonset, true)}` : safe(null)} />}
        {isVisible(visibleMetrics, "sunrise") && <DetailRow label="Sunrise / sunset" value={day.sun ? `${formatHour(day.sun.sunrise, true)} / ${formatHour(day.sun.sunset, true)}` : safe(null)} />}
        {isVisible(visibleMetrics, "firstLight") && <DetailRow label="First light / last light" value={day.sun ? `${formatOptionalHour(day.sun.firstLight, true)} / ${formatOptionalHour(day.sun.lastLight, true)}` : safe(null)} />}
      </div>
    </article>
  );
}

// Weather: air temp range + feels, wind + gust, rain, cloud, UV.
export function WeatherDetailsCard({ day, hour, visibleMetrics }: { day: ClaudeDayData; hour: number; visibleMetrics?: VisibleMetrics }) {
  const airTempRange = day.ranges?.airTemp;
  const windRange = day.ranges?.wind;

  return (
    <article className="mx-4 mt-2 rounded-3xl border border-hull-700/70 bg-hull-800 p-4">
      <div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400">
        <Cloud size={13} className="text-sky-300" />
        Weather
      </div>
      <div className="mt-2">
        {isVisible(visibleMetrics, "airTemperature") && <DetailRow label="Current air temperature" value={`${safe(day.hours[hour]?.airTemp)}°C`} />}
        {isVisible(visibleMetrics, "airTemperature") && <DetailRow label="Air temp high / low" value={airTempRange ? `${safe(airTempRange.max)}° / ${safe(airTempRange.min)}°C` : safe(null)} />}
        {isVisible(visibleMetrics, "feelsLike") && <DetailRow label="Feels like" value={day.secondary?.airTemp ? `${safe(day.secondary.airTemp.feels)}°C` : safe(null)} />}
        {isVisible(visibleMetrics, "wind") && <DetailRow label="Current wind" value={safe(day.hours[hour]?.windLabel)} />}
        {isVisible(visibleMetrics, "wind") && <DetailRow label="Wind speed / direction" value={day.hours[hour] ? `${safe(day.hours[hour].wind.speed)} kts ${safe(day.hours[hour].wind.dir)}` : safe(null)} />}
        {isVisible(visibleMetrics, "gust") && <DetailRow label="Sustained wind / max gust" value={windRange ? `${safe(windRange.min)}-${safe(windRange.max)} km/h · gust ${safe(windRange.maxGust)} km/h` : safe(null)} />}
        {isVisible(visibleMetrics, "cloud") && <DetailRow label="Cloud cover" value={day.hours[hour] ? `${safe(day.hours[hour].cloudCover)}%` : safe(null)} />}
        {isVisible(visibleMetrics, "rainChance") && <DetailRow label="Rain chance" value={day.hours[hour] ? `${safe(day.hours[hour].rainChance)}%` : safe(null)} />}
        {isVisible(visibleMetrics, "rainVolume") && <DetailRow label="Rain chance / volume" value={`${safe(day.secondary?.rain?.chance)}% · ${safe(null)}`} />}
        {isVisible(visibleMetrics, "cloud") && <DetailRow label="Cloud cover baseline" value={day.ranges?.cloudBaseline !== undefined ? `${day.ranges.cloudBaseline}%` : safe(null)} />}
        {isVisible(visibleMetrics, "uv") && <DetailRow label="Peak UV index" value={safe(day.ranges?.uvPeak)} />}
      </div>
    </article>
  );
}

export function FullConditionsView({ day, hour, onClose, visibleMetrics }: { day: ClaudeDayData; hour: number; onClose: () => void; visibleMetrics?: VisibleMetrics }) {
  return (
    <div className="bg-hull-950 px-4 pb-32 pt-4">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div>
          <p className="font-body text-[11px] uppercase tracking-wide text-slate-500">Daily details</p>
          <h2 className="font-display text-xl font-semibold text-white">Full Conditions</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close Full Conditions" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300">
          Done
        </button>
      </div>
      <div className="mx-auto mt-3 max-w-md space-y-2">
        <WaterDetailsCard day={day} hour={hour} visibleMetrics={visibleMetrics} />
        <SolunarDetailsCard day={day} hour={hour} visibleMetrics={visibleMetrics} />
        <WeatherDetailsCard day={day} hour={hour} visibleMetrics={visibleMetrics} />
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
  onDragEnd
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
  const isTopDock = dockPosition === "top";
  const drawerVisible = open || isDragging || expansionProgress > 0;
  const viewportHeight = typeof window === "undefined" ? 812 : window.innerHeight;
  const drawerTravel = Math.max(0, viewportHeight - 72 - 132);
  const show = (id: string) => hourlySettings?.[id] !== false;

  return (
    <>
      <button
        type="button"
        aria-label="Close full day view"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Full day forecast"
        className={`fixed left-0 right-0 z-50 mx-auto flex max-w-md flex-col overflow-hidden border-hull-700 bg-hull-900 ${isDragging ? "" : "transition-[height] duration-300 ease-out"} ${
          isTopDock
            ? "top-[204px] rounded-b-3xl border-b"
            : "bottom-0 rounded-t-3xl border-t"
        }`}
        style={{ height: `${expansionProgress * drawerTravel}px` }}
      >
        <div className={`flex shrink-0 items-center justify-between px-5 pb-2 pt-3 ${isTopDock ? "order-first" : ""}`}>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Full day forecast</h2>
            <p className="font-body text-[12.5px] text-slate-500">Tap a row to jump there</p>
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
        <div className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain px-5 pb-4">
          <div className="min-w-[880px]">
            <div className="flex gap-3 border-b border-hull-700/70 pb-2 font-body text-[11px] uppercase tracking-wide text-slate-500">
              <span>Time</span>
              {show("hourlyScore") && <span>Score</span>}
              {show("tide") && <span>Tide</span>}
              {show("tide") && <span>Direction</span>}
              {show("solunarActive") && <span>Solunar</span>}
              {show("wind") && <span>Wind</span>}
              {show("pressure") && <span>Press.</span>}
              {show("airTemperature") && <span>Temp</span>}
              {show("cloud") && <span>Cloud</span>}
              {show("rainChance") && <span>Rain</span>}
              {show("uv") && <span>UV</span>}
            </div>
            {day.hours.map(item => (
              <button
                key={item.hour}
                type="button"
                onClick={() => {
                  onPickHour(item.hour);
                  onClose();
                }}
                className={`flex min-h-[48px] w-full items-center gap-3 border-b border-hull-700/50 py-3 text-left ${item.hour === selectedHour ? "bg-tide-500/10" : ""}`}
              >
                <span className={`font-body text-[13px] font-semibold tabular-nums ${item.hour === selectedHour ? "text-tide-400" : "text-white"}`}>{formatHour(item.hour)}</span>
                {show("hourlyScore") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.score)}</span>}
                {show("tide") && <span className="font-body text-[13px] tabular-nums text-slate-300">{item.tideHeight.toFixed(1)}m</span>}
                {show("tide") && <span className="font-body text-[12.5px] text-slate-400">{safe(item.tideDirection, "N/A")}</span>}
                {show("solunarActive") && <span className="font-body text-[12.5px] text-slate-400">{item.solunar === "none" ? "Neutral" : item.solunar === "major" ? "Major" : "Minor"}</span>}
                {show("wind") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.wind?.speed)}kt {safe(item.wind?.dir, "")}</span>}
                {show("pressure") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.pressure)}</span>}
                {show("airTemperature") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.airTemp)}°</span>}
                {show("cloud") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.cloudCover)}%</span>}
                {show("rainChance") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.rainChance)}%</span>}
                {show("uv") && <span className="font-body text-[12.5px] tabular-nums text-slate-300">{safe(item.uvIndex, "N/A")}</span>}
              </button>
            ))}
          </div>
        </div>
        {isTopDock && onDragStart && onDragMove && onDragEnd && (
          <div
            className="flex h-12 shrink-0 cursor-grab touch-none items-center justify-center border-t border-hull-700/60 active:cursor-grabbing"
            onPointerDown={event => {
              event.currentTarget.setPointerCapture(event.pointerId);
              onDragStart(event.clientY);
            }}
            onPointerMove={event => onDragMove(event.clientY)}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            aria-label="Slide the full day forecast back up"
          >
            <div className="h-1 w-10 rounded-full bg-hull-600/90" />
          </div>
        )}
      </section>
    </>
  );
}
