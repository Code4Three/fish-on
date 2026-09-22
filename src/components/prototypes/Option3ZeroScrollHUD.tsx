import { useState } from "react";
import { ChevronLeft, ChevronRight, Fish, Settings, X } from "lucide-react";
import type { ClaudeDayData } from "../../data/mockMarineData";
import { useAnchoredSettings } from "../../hooks/useAnchoredSettings";
import CustomizationBottomSheet from "../settings/CustomizationBottomSheet";
import {
  DashboardStateProps,
  DayDrawer,
  Sparkline,
  formatDate,
  formatHour,
  getMetricDisplay,
  metrics,
  ratingTier,
  scoreBandTone,
  type MetricKey
} from "./shared";

function CompactStepButton({
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
      className={`flex h-12 w-12 shrink-0 items-center justify-center ${disabled ? "text-slate-600" : "text-slate-300"}`}
    >
      {direction === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

function MicroTile({
  id,
  day,
  hour,
  onSelect
}: {
  id: MetricKey;
  day: ClaudeDayData;
  hour: number;
  onSelect: (id: MetricKey) => void;
}) {
  const metric = metrics.find(item => item.id === id)!;
  const Icon = metric.icon;
  const [value, unit] = getMetricDisplay(id, day, hour);

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border border-hull-700/70 bg-hull-800 px-1 py-1.5"
    >
      <Icon size={14} className={metric.tint} />
      <span className="font-display text-[13px] font-bold leading-none tabular-nums text-white">{value}{unit}</span>
      <span className="truncate font-body text-[9px] leading-none text-slate-500">{metric.label}</span>
    </button>
  );
}

// Only wind has a genuine hourly series in the mock data; other secondary metrics are day-level constants.
function MicroTileDetailSheet({
  id,
  day,
  hour,
  onClose
}: {
  id: MetricKey | null;
  day: ClaudeDayData;
  hour: number;
  onClose: () => void;
}) {
  const open = id !== null;
  const metric = id ? metrics.find(item => item.id === id)! : null;
  const [value, unit, detail] = id ? getMetricDisplay(id, day, hour) : ["", "", ""];
  const windSeries = day.hours.map(item => item.wind.speed);

  return (
    <>
      <button
        type="button"
        aria-label="Close metric detail"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Metric detail"
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-hull-700 bg-hull-900 transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-10 rounded-full bg-hull-600" />
        </div>
        <div className="flex items-center justify-between px-5 pb-1 pt-3">
          <h2 className="font-display text-lg font-semibold text-white">{metric?.label ?? "Metric detail"}</h2>
          <button type="button" onClick={onClose} aria-label="Close metric detail" className="flex h-12 w-12 items-center justify-center text-slate-400">
            <X size={22} />
          </button>
        </div>
        <div className="px-5 pb-6">
          <p className="font-display text-[34px] font-bold tabular-nums text-white">
            {value}
            <span className="ml-1 text-lg font-medium text-slate-400">{unit}</span>
          </p>
          <p className="mt-1 font-body text-[13px] text-slate-400">{detail}</p>
          {id === "wind" && (
            <div className="mt-4 flex h-16 items-center rounded-2xl border border-hull-700/70 bg-hull-800 px-3">
              <Sparkline values={windSeries} activeIndex={hour} stroke="#38BDF8" label="Wind speed 24h trend" />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// Prototype 3: everything fits inside a single fixed mobile viewport, no page scroll.
export default function Option3ZeroScrollHUD({ day, hour, offset, onHourChange, onOffsetChange, prototype, onSelectPrototype }: DashboardStateProps) {
  const { settings, toggleMetric, resetSettings } = useAnchoredSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);
  const [activeTile, setActiveTile] = useState<MetricKey | null>(null);

  const current = day.hours[hour];
  const tideSeries = day.hours.map(item => item.tideHeight);
  const rising = day.hours[Math.min(23, hour + 1)].tideHeight > current.tideHeight;
  const tone = scoreBandTone(current.scoreBand);

  const windows = [
    { type: "Major", start: day.majorWindow.start, end: day.majorWindow.end },
    ...day.minorWindows.map(window => ({ type: "Minor", start: window.start, end: window.end }))
  ];
  const activeWindow = windows.find(window => hour >= window.start && hour < window.end)
    ?? windows.find(window => window.start >= hour)
    ?? windows[0];

  return (
    <main className="mx-auto flex h-screen max-h-[812px] w-full max-w-[375px] flex-col overflow-hidden bg-hull-950 font-body">
      <header className="flex shrink-0 flex-col border-b border-hull-700/60">
        <div className="flex h-12 items-center justify-between px-2">
          <h1 className="truncate font-display text-[13px] font-semibold text-white">Mooloolaba River Mouth</h1>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open display settings"
            className="flex h-12 w-12 shrink-0 items-center justify-center text-slate-300"
          >
            <Settings size={18} />
          </button>
        </div>
        <div className="flex h-12 items-center justify-between px-1">
          <div className="flex items-center">
            <CompactStepButton label="Prev Day" direction="left" onClick={() => onOffsetChange(offset - 1)} />
            <span className="min-w-[68px] truncate text-center font-body text-[10.5px] font-semibold text-slate-300">{formatDate(offset)}</span>
            <CompactStepButton label="Next Day" direction="right" onClick={() => onOffsetChange(offset + 1)} />
          </div>
          <div className="flex items-center">
            <CompactStepButton label="Prev Hour" direction="left" disabled={hour === 0} onClick={() => onHourChange(Math.max(0, hour - 1))} />
            <span className="min-w-[56px] truncate text-center font-body text-[10.5px] font-semibold tabular-nums text-white">{formatHour(hour)}</span>
            <CompactStepButton label="Next Hour" direction="right" disabled={hour === 23} onClick={() => onHourChange(Math.min(23, hour + 1))} />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2 border-b border-hull-700/60 p-2" style={{ flex: "5 1 0%" }}>
        <article className="flex flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800 p-3">
          <div className="font-body text-[11px] text-slate-400">Tide height</div>
          <div>
            <p className="font-display text-[26px] font-bold tabular-nums text-white">
              {current.tideHeight.toFixed(1)}
              <span className="ml-1 text-sm font-medium text-slate-400">m</span>
            </p>
            <p className={`font-body text-[11px] font-semibold ${rising ? "text-tide-400" : "text-amber-300"}`}>{rising ? "Rising" : "Falling"}</p>
          </div>
          <Sparkline values={tideSeries} activeIndex={hour} stroke="#22C58A" dotColor="#4ADE9C" label="Tide height trend" height={28} />
        </article>
        <article className="flex flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800 p-3">
          <div className="font-body text-[11px] text-slate-400">Solunar feeding</div>
          <div>
            <p className="font-display text-[26px] font-bold tabular-nums text-white">
              {day.solunarRating}
              <span className="ml-1 text-sm font-medium text-slate-400">%</span>
            </p>
            <p className={`font-body text-[11px] font-semibold ${tone.text}`}>{ratingTier(day.solunarRating)}</p>
          </div>
          <p className="truncate font-body text-[11px] text-slate-400">{activeWindow.type}: {formatHour(activeWindow.start, true)} - {formatHour(activeWindow.end, true)}</p>
        </article>
      </section>

      <section className="grid grid-cols-4 grid-rows-2 gap-2 p-2" style={{ flex: "4 1 0%" }}>
        {metrics.map(metric => (
          <MicroTile key={metric.id} id={metric.id} day={day} hour={hour} onSelect={setActiveTile} />
        ))}
      </section>

      <button
        type="button"
        onClick={() => setDayViewOpen(true)}
        className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-hull-700/60 font-body text-[12px] font-semibold text-slate-300"
      >
        <Fish size={14} className="text-tide-400" />
        View Full Day (24h)
      </button>

      <DayDrawer open={dayViewOpen} day={day} selectedHour={hour} onClose={() => setDayViewOpen(false)} onPickHour={onHourChange} />
      <MicroTileDetailSheet id={activeTile} day={day} hour={hour} onClose={() => setActiveTile(null)} />
      <CustomizationBottomSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onToggle={toggleMetric}
        onReset={resetSettings}
        prototype={prototype}
        onSelectPrototype={onSelectPrototype}
        showMetricsSection={false}
      />
    </main>
  );
}
