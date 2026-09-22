import { useState } from "react";
import { Fish, Settings, Waves } from "lucide-react";
import { useAnchoredSettings } from "../hooks/useAnchoredSettings";
import CustomizationBottomSheet from "./settings/CustomizationBottomSheet";
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
  metrics,
  ratingTier
} from "./prototypes/shared";

// Production dashboard: bottom-dock thumb-first layout (formerly Prototype 1). Settings live in the header only.
export default function MainDashboard({ day, hour, offset, onHourChange, onOffsetChange, prototype, onSelectPrototype }: DashboardStateProps) {
  const { settings, toggleMetric, resetSettings } = useAnchoredSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);

  const current = day.hours[hour];
  const rising = day.hours[Math.min(23, hour + 1)].tideHeight > current.tideHeight;

  return (
    <main className="relative min-h-screen max-w-md mx-auto bg-hull-950 font-body">
      <header className="sticky top-0 z-20 bg-hull-950/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tide-500/15 text-tide-400">
              <Fish size={16} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[16px] font-semibold text-white">Mooloolaba River Mouth</h1>
              <p className="flex items-center gap-1.5 truncate font-body text-[12px] text-slate-400">
                <Waves size={12} className="shrink-0 text-tide-400" />
                {current.tideHeight.toFixed(1)}m {rising ? "rising" : "falling"} · {ratingTier(day.solunarRating)} solunar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open display settings"
            className="flex h-12 w-12 shrink-0 items-center justify-center text-slate-300"
          >
            <Settings size={20} />
          </button>
        </div>
        <div className="absolute inset-x-2 bottom-0 h-px bg-hull-600/80" />
      </header>

      <div className="pb-44">
        <ScoreCard day={day} hour={hour} />
        <TideCard day={day} hour={hour} />
        <SolunarCard day={day} hour={hour} />
        <section className="mt-3 px-4">
          <div className="grid grid-cols-2 gap-3">
            {metrics.filter(metric => settings[metric.id]).map(metric => (
              <MetricCard key={metric.id} id={metric.id} day={day} hour={hour} />
            ))}
          </div>
        </section>
        <button
          type="button"
          onClick={() => setDayViewOpen(true)}
          className="mx-4 mt-4 flex h-12 w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border border-hull-700 bg-hull-800 font-body text-[13.5px] font-semibold text-slate-200"
        >
          View Full Day (24h)
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-md bg-hull-950/75 px-4 pb-4 pt-3 backdrop-blur">
        <div className="absolute inset-x-1 top-0 h-px bg-hull-600/80" />
        <div className="flex items-center justify-between gap-1">
          <StepButton label="Prev Day" direction="left" onClick={() => onOffsetChange(offset - 1)} />
          <span className="min-h-12 flex-1 truncate bg-transparent px-2 text-center font-body text-[13px] font-semibold leading-[48px] text-white">
            {formatDate(offset)}
          </span>
          <StepButton label="Next Day" direction="right" onClick={() => onOffsetChange(offset + 1)} />
        </div>
        <div className="mt-2">
          <HourPills hour={hour} day={day} onHourChange={onHourChange} />
        </div>
      </div>

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
