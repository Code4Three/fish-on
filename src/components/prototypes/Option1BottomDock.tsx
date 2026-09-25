import { useState } from "react";
import { Fish, Settings, Waves } from "lucide-react";
import { useAnchoredSettings } from "../../hooks/useAnchoredSettings";
import CustomizationBottomSheet from "../settings/CustomizationBottomSheet";
import {
    DashboardStateProps,
    DayDrawer,
    HourPills,
    MetricCard,
    PressureCard,
    ScoreCard,
    SolunarCard,
    StepButton,
    TideCard,
    formatDate,
    formatTideHeight,
    isTideRising,
    metrics,
    ratingTier
} from "./shared";

// Prototype 1: thumb-first layout - minimal header, scrollable feed, fixed bottom dock for all controls.
export default function Option1BottomDock({ day, hour, offset, canGoPrevious, canGoNext, onHourChange, onOffsetChange, prototype, onSelectPrototype }: DashboardStateProps) {
    const { settings, cardSettings, toggleCard, resetSettings } = useAnchoredSettings();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [dayViewOpen, setDayViewOpen] = useState(false);

    const current = day.hours[hour];
    const rising = isTideRising(day, hour);

    return (
        <main className="no-scrollbar relative min-h-screen max-w-md mx-auto overflow-y-auto bg-hull-950 font-body">
            <header className="sticky top-0 z-20 bg-hull-950/95 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tide-500/15 text-tide-400">
                        <Fish size={16} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate font-display text-[16px] font-semibold text-white">Mooloolaba River Mouth</h1>
                        <p className="flex items-center gap-1.5 truncate font-body text-[12px] text-slate-400">
                            <Waves size={12} className="shrink-0 text-tide-400" />
                            {formatTideHeight(current?.tideHeight)}m {rising ? "rising" : "falling"} · {ratingTier(day.solunarRating)} solunar
                        </p>
                    </div>
                    <div className="w-full flex justify-end items-center">
                        <button type="button" aria-label="Open display settings" className="flex h-12 justify-end pl-3.5 pr-0 shrink-0 items-center justify-center text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-settings" aria-hidden="true">
                                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="absolute inset-x-2 bottom-0 h-px bg-hull-600/80" />
            </header>

            {/* Stacked summary cards, then the individually-toggleable metric card grid */}
            <div className="pb-44">
                <ScoreCard day={day} hour={hour} />
                <TideCard day={day} hour={hour} />
                <SolunarCard day={day} hour={hour} />
                <PressureCard day={day} hour={hour} />
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

            {/* Fixed bottom dock: day navigation, hour pills, and the settings entry point */}
            <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-md bg-hull-950/75 px-4 pb-4 pt-3 backdrop-blur">
                <div className="absolute inset-x-1 top-0 h-px bg-hull-600/80" />
                <div className="flex items-center justify-between gap-1">
                        <StepButton label="Prev Day" direction="left" disabled={!canGoPrevious} onClick={() => onOffsetChange(offset - 1)} />
                    <span className="min-h-12 flex-2 truncate bg-transparent px-2 text-center font-body text-[13px] font-semibold leading-[48px] text-white">
                        {formatDate(day.date)}
                    </span>
                        <StepButton label="Next Day" direction="right" disabled={!canGoNext} onClick={() => onOffsetChange(offset + 1)} />
                    <button
                        type="button"
                        onClick={() => setSettingsOpen(true)}
                        aria-label="Open display settings"
                        className="flex h-12 w-12 shrink-0 items-center justify-center text-slate-300"
                    >
                        <Settings size={20} />
                    </button>
                </div>
                <div className="mt-2">
                    <HourPills hour={hour} day={day} onHourChange={onHourChange} />
                </div>
            </div>

            <DayDrawer open={dayViewOpen} day={day} selectedHour={hour} onClose={() => setDayViewOpen(false)} onPickHour={onHourChange} />
            <CustomizationBottomSheet
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                settings={cardSettings}
                onToggle={toggleCard}
                onReset={resetSettings}
                prototype={prototype}
                onSelectPrototype={onSelectPrototype}
            />
        </main>
    );
}
