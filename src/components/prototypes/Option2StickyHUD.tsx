import { useState } from "react";
import { Fish, Pin, Settings, Waves, Wind } from "lucide-react";
import { useAnchoredSettings } from "../../hooks/useAnchoredSettings";
import CustomizationBottomSheet from "../settings/CustomizationBottomSheet";
import {
  DashboardStateProps,
  DayDrawer,
  HourPills,
  MetricCard,
  ScoreCard,
  SolunarCard,
  StepButton,
  TideCard,
  formatDate,
  getMetricDisplay,
  metrics
} from "./shared";

type Tab = "tide" | "wind";

// Prototype 2: sticky pinned HUD metrics + tabbed content switcher below.
export default function Option2StickyHUD({ day, hour, offset, onHourChange, onOffsetChange, prototype, onSelectPrototype }: DashboardStateProps) {
  const { settings, toggleMetric, resetSettings } = useAnchoredSettings();
  const [tab, setTab] = useState<Tab>("tide");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);

  const current = day.hours[hour];
  const [windSpeed, windUnit, windDetail] = getMetricDisplay("wind", day, hour);
  const windDirection = windDetail.split(" · ")[0];

  return (
    <main className="min-h-screen max-w-md mx-auto bg-hull-950 pb-10 font-body">
      <div className="sticky top-0 z-20 border-b border-hull-700/60 bg-hull-950/95 backdrop-blur">
        <header className="flex h-12 items-center justify-between px-4">
          <h1 className="truncate font-display text-[15px] font-semibold text-white">Mooloolaba River Mouth</h1>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open display settings"
            className="flex h-12 w-12 items-center justify-center text-slate-300"
          >
            <Settings size={20} />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          <div className="relative flex min-h-[64px] flex-col justify-center rounded-2xl border border-hull-700/70 bg-hull-800 px-3 py-2">
            <Pin size={12} className="absolute right-2 top-2 text-slate-500" aria-hidden="true" />
            <p className="flex items-center gap-1 font-body text-[11px] text-slate-400">
              <Waves size={12} className="text-tide-400" />
              Tide height
            </p>
            <p className="font-display text-[20px] font-bold tabular-nums text-white">
              {current.tideHeight.toFixed(1)}
              <span className="ml-1 text-xs font-medium text-slate-400">m</span>
            </p>
          </div>
          <div className="relative flex min-h-[64px] flex-col justify-center rounded-2xl border border-hull-700/70 bg-hull-800 px-3 py-2">
            <Pin size={12} className="absolute right-2 top-2 text-slate-500" aria-hidden="true" />
            <p className="flex items-center gap-1 font-body text-[11px] text-slate-400">
              <Wind size={12} className="text-sky-300" />
              Wind
            </p>
            <p className="font-display text-[20px] font-bold tabular-nums text-white">
              {windSpeed}
              <span className="ml-1 text-xs font-medium text-slate-400">{windUnit} · {windDirection}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={() => setTab("tide")}
            className={`flex h-12 flex-1 items-center justify-center rounded-xl font-body text-[13px] font-semibold ${tab === "tide" ? "bg-tide-500 text-hull-950" : "border border-hull-700 bg-hull-800 text-slate-300"}`}
          >
            Tide &amp; Solunar
          </button>
          <button
            type="button"
            onClick={() => setTab("wind")}
            className={`flex h-12 flex-1 items-center justify-center rounded-xl font-body text-[13px] font-semibold ${tab === "wind" ? "bg-tide-500 text-hull-950" : "border border-hull-700 bg-hull-800 text-slate-300"}`}
          >
            Wind &amp; Weather
          </button>
        </div>

        <div className="border-t border-hull-700/60 px-4 py-2">
          <div className="flex items-center justify-between">
            <StepButton label="Prev Day" direction="left" onClick={() => onOffsetChange(offset - 1)} />
            <span className="font-body text-[13px] font-semibold text-white">{formatDate(offset)}</span>
            <StepButton label="Next Day" direction="right" onClick={() => onOffsetChange(offset + 1)} />
          </div>
          <div className="mt-2">
            <HourPills hour={hour} day={day} onHourChange={onHourChange} />
          </div>
        </div>
      </div>

      {tab === "tide" ? (
        <>
          <ScoreCard day={day} hour={hour} />
          <TideCard day={day} hour={hour} />
          <SolunarCard day={day} hour={hour} />
        </>
      ) : (
        <section className="mt-3 px-4">
          <div className="grid grid-cols-2 gap-3">
            {metrics.filter(metric => settings[metric.id]).map(metric => (
              <MetricCard key={metric.id} id={metric.id} day={day} hour={hour} />
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setDayViewOpen(true)}
        className="mx-4 mt-4 flex h-12 w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border border-hull-700 bg-hull-800 font-body text-[13.5px] font-semibold text-slate-200"
      >
        <Fish size={16} className="text-tide-400" />
        View Full Day (24h)
      </button>

      <DayDrawer open={dayViewOpen} day={day} selectedHour={hour} onClose={() => setDayViewOpen(false)} onPickHour={onHourChange} />
      <CustomizationBottomSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onToggle={toggleMetric}
        onReset={resetSettings}
        prototype={prototype}
        onSelectPrototype={onSelectPrototype}
      />
    </main>
  );
}
