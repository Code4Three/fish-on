import { useEffect, useRef } from "react";
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
import type { ClaudeDayData } from "../../data/mockMarineData";
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
  { id: "pressure", label: "Barometric pressure", icon: Gauge, tint: "text-amber-300", ring: "bg-amber-400/10" },
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

export function getMetricDisplay(id: MetricKey, day: ClaudeDayData, hour: number): [string, string, string] {
  const wind = day.hours[hour].wind;
  const data: Record<MetricKey, [string, string, string]> = {
    wind: [`${wind.speed}`, "kts", `${wind.dir} · Gusts ${wind.gust} kts`],
    pressure: [`${day.secondary.pressure.value}`, "hPa", day.secondary.pressure.trend],
    waterTemp: [day.secondary.waterTemp, "°C", "Surface reading"],
    swell: [day.secondary.swell.height, "m", `@ ${day.secondary.swell.period}s ${day.secondary.swell.dir}`],
    moonPhase: [`${day.secondary.moon.illum}`, "%", day.secondary.moon.phaseName],
    rain: [`${day.secondary.rain.chance}`, "%", `${day.secondary.rain.mm.toFixed(1)}mm chance`],
    uv: [`${day.secondary.uv}`, "", uvLabel(day.secondary.uv)],
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

export function ScoreCard({ day, hour }: { day: ClaudeDayData; hour: number }) {
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
        <div className="mt-1 flex items-center gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">{current.score}</span>
            <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${tone.chip}`}>{current.scoreBand}</span>
          </div>
          <Sparkline values={values} activeIndex={hour} stroke={tone.stroke} label="Fishing score trend" />
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">{nextPeak ? "Next strong window" : "Based on tide + solunar"}</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextPeak ? `${formatHour(nextPeak.hour)} (${nextPeak.score})` : "No stronger window today"}</span>
        </div>
      </div>
    </article>
  );
}

export function TideCard({ day, hour }: { day: ClaudeDayData; hour: number }) {
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
        <div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2">
          <span className="font-body text-[13px] font-medium text-slate-300">Next {nextEvent.type.toLowerCase()} tide</span>
          <span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextEvent.type}: {formatHour(nextEvent.hour, true)} ({nextEvent.height.toFixed(1)}m)</span>
        </div>
      </div>
    </article>
  );
}

export function SolunarCard({ day, hour }: { day: ClaudeDayData; hour: number }) {
  const windows = [
    { type: "Major", start: day.majorWindow.start, end: day.majorWindow.end },
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
        <div className="mt-2 flex items-center gap-2.5 border-t border-hull-700/70 pt-2">
          <Fish size={16} className="text-slate-300" />
          <div className="leading-tight">
            <p className="font-body text-[11.5px] text-slate-500">Active feeding window</p>
            <p className="font-display text-[14px] font-semibold text-white">{activeWindow.type}: {formatHour(activeWindow.start, true)} - {formatHour(activeWindow.end, true)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MetricCard({ id, day, hour }: { id: MetricKey; day: ClaudeDayData; hour: number }) {
  const metric = metrics.find(item => item.id === id)!;
  const Icon = metric.icon;
  const [value, unit, detail] = getMetricDisplay(id, day, hour);

  return (
    <article className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800 p-3">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${metric.ring}`}>
          <Icon size={14} className={metric.tint} />
        </div>
        <p className="font-body text-[11.5px] leading-tight text-slate-400">{metric.label}</p>
      </div>
      <div>
        <p className="font-display text-[21px] font-bold leading-none tabular-nums text-white">
          {value}
          <span className="ml-1 font-body text-[13px] font-medium text-slate-400">{unit}</span>
        </p>
        <p className="mt-1 truncate font-body text-[11px] text-slate-500">{detail}</p>
      </div>
    </article>
  );
}

export function DayDrawer({
  open,
  day,
  selectedHour,
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
        <div className="grid grid-cols-[64px_1fr_1.3fr_1.3fr] gap-2 border-b border-hull-700/70 px-5 py-2 font-body text-[11px] uppercase tracking-wide text-slate-500">
          <span>Time</span>
          <span>Tide</span>
          <span>Solunar</span>
          <span>Wind</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
          {day.hours.map(item => (
            <button
              key={item.hour}
              type="button"
              onClick={() => {
                onPickHour(item.hour);
                onClose();
              }}
              className={`grid min-h-[48px] w-full grid-cols-[64px_1fr_1.3fr_1.3fr] items-center gap-2 border-b border-hull-700/50 py-3 text-left ${item.hour === selectedHour ? "bg-tide-500/10" : ""}`}
            >
              <span className={`font-body text-[13px] font-semibold tabular-nums ${item.hour === selectedHour ? "text-tide-400" : "text-white"}`}>{formatHour(item.hour)}</span>
              <span className="font-body text-[13px] tabular-nums text-slate-300">{item.tideHeight.toFixed(1)}m</span>
              <span className="font-body text-[12.5px] text-slate-400">{item.solunar === "none" ? "-" : item.solunar}</span>
              <span className="font-body text-[12.5px] tabular-nums text-slate-300">{item.wind.speed}kt {item.wind.dir}</span>
            </button>
          ))}
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
