import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, Fish, Settings } from "lucide-react";
import type { ClaudeDayData } from "../../data/mockMarineData";
import { useAnchoredSettings } from "../../hooks/useAnchoredSettings";
import CustomizationBottomSheet from "../settings/CustomizationBottomSheet";
import {
  DashboardStateProps,
  DayDrawer,
  MetricCard,
  ScoreCard,
  SolunarCard,
  StepButton,
  TideCard,
  formatDate,
  formatHour,
  metrics,
  solunarLabel
} from "./shared";

function TimeBar({
  hour,
  day,
  onHourChange,
  onOpenDayView
}: {
  hour: number;
  day: ClaudeDayData;
  onHourChange: (hour: number) => void;
  onOpenDayView: () => void;
}) {
  const pillRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  useEffect(() => {
    pillRefs.current[hour]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [hour]);

  return (
    <section className="px-4 pb-3 pt-2">
      <div className="flex items-center justify-between">
        <StepButton label="Prev Hour" direction="left" disabled={hour === 0} onClick={() => onHourChange(Math.max(0, hour - 1))} />
        <div className="text-center leading-tight">
          <p className="font-display text-[17px] font-bold tabular-nums text-white">{formatHour(hour)}</p>
          <p className={`font-body text-[12px] font-medium ${day.hours[hour].solunar === "major" ? "text-tide-400" : day.hours[hour].solunar === "minor" ? "text-amber-300" : "text-slate-500"}`}>
            {solunarLabel(day.hours[hour].solunar)}
          </p>
        </div>
        <StepButton label="Next Hour" direction="right" disabled={hour === 23} onClick={() => onHourChange(Math.min(23, hour + 1))} />
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        {day.hours.map(({ hour: value }) => (
          <button
            key={value}
            ref={element => { pillRefs.current[value] = element; }}
            type="button"
            onClick={() => onHourChange(value)}
            aria-current={value === hour ? "time" : undefined}
            className={`flex h-8 shrink-0 items-center rounded-full px-3.5 font-body text-[13px] font-semibold ${value === hour ? "bg-tide-500 text-hull-950" : "border border-hull-700 bg-hull-800 text-slate-300"}`}
          >
            {formatHour(value)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpenDayView}
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-hull-700 bg-hull-800 font-body text-[13.5px] font-semibold text-slate-200"
      >
        <Clock size={16} />
        View Full Day (24h)
      </button>
    </section>
  );
}

// Prototype 0: the original stacked layout, unchanged apart from sharing state/cards with the other prototypes.
export default function Option0Current({ day, hour, offset, onHourChange, onOffsetChange, prototype, onSelectPrototype }: DashboardStateProps) {
  const { settings, toggleMetric, resetSettings } = useAnchoredSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);

  return (
    <main className="min-h-screen max-w-md mx-auto bg-hull-950 pb-10 font-body">
      <div className="sticky top-0 z-20 border-b border-hull-700/60 bg-hull-950/95 backdrop-blur">
        <header className="flex h-14 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tide-500/15 text-tide-400">
              <Fish size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-body text-[10px] text-slate-500">Fish On · Current spot</p>
              <h1 className="truncate font-display text-[16px] font-semibold text-white">Mooloolaba River Mouth</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open display settings"
            className="flex h-10 w-10 items-center justify-center text-slate-300"
          >
            <Settings size={21} />
          </button>
        </header>
        <div className="border-t border-hull-700/60 px-2 py-1">
          <div className="flex items-center justify-between">
            <StepButton label="Prev Day" direction="left" onClick={() => onOffsetChange(offset - 1)} />
            <div className="flex items-center gap-1.5 font-body text-[14px] font-semibold text-white">
              <Calendar size={14} className="text-slate-500" />
              {formatDate(offset)}
            </div>
            <StepButton label="Next Day" direction="right" onClick={() => onOffsetChange(offset + 1)} />
          </div>
        </div>
        <TimeBar hour={hour} day={day} onHourChange={onHourChange} onOpenDayView={() => setDayViewOpen(true)} />
      </div>
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
