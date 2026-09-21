import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Cloud, CloudRain, Clock, Fish, Gauge, Moon, RotateCcw, Settings, Sun, Thermometer, Waves, Wind, X } from "lucide-react";
import { generateClaudeDayData, type ClaudeDayData } from "../data/mockMarineData";
import { useAnchoredSettings, type AnchoredSettingsState } from "../hooks/useAnchoredSettings";

const BASE_DATE = new Date(2026, 8, 21);
const DEFAULT_HOUR = 7;
type MetricKey = keyof AnchoredSettingsState;
const metrics: Array<{ id: MetricKey; label: string; icon: typeof Wind; tint: string; ring: string }> = [
  { id: "wind", label: "Wind", icon: Wind, tint: "text-sky-300", ring: "bg-sky-400/10" },
  { id: "pressure", label: "Barometric pressure", icon: Gauge, tint: "text-amber-300", ring: "bg-amber-400/10" },
  { id: "waterTemp", label: "Water temp", icon: Thermometer, tint: "text-orange-300", ring: "bg-orange-400/10" },
  { id: "swell", label: "Swell", icon: Waves, tint: "text-cyan-300", ring: "bg-cyan-400/10" },
  { id: "moonPhase", label: "Moon phase", icon: Moon, tint: "text-indigo-300", ring: "bg-indigo-400/10" },
  { id: "rain", label: "Rain", icon: CloudRain, tint: "text-blue-300", ring: "bg-blue-400/10" },
  { id: "uv", label: "UV index", icon: Sun, tint: "text-yellow-300", ring: "bg-yellow-400/10" },
  { id: "airTemp", label: "Air temp", icon: Cloud, tint: "text-emerald-200", ring: "bg-emerald-400/10" }
];

function formatHour(hour: number, minutes = false) {
  const wholeHour = Math.floor(hour);
  const display = wholeHour % 12 || 12;
  return `${display}${minutes ? `:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}` : ""} ${wholeHour >= 12 ? "PM" : "AM"}`;
}
function formatDate(offset: number) {
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
function solunarLabel(level: ClaudeDayData["hours"][number]["solunar"]) {
  if (level === "major") return "Major Solunar Window";
  if (level === "minor") return "Minor Solunar Window";
  return "Low Solunar Activity";
}
function ratingTier(value: number) {
  if (value >= 80) return "Peak";
  if (value >= 60) return "Good";
  if (value >= 40) return "Fair";
  return "Slow";
}
function uvLabel(value: number) {
  if (value <= 2) return "Low";
  if (value <= 5) return "Moderate";
  if (value <= 7) return "High";
  if (value <= 10) return "Very High";
  return "Extreme";
}

function StepButton({ label, direction, disabled = false, onClick }: { label: string; direction: "left" | "right"; disabled?: boolean; onClick: () => void }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className={`flex h-9 items-center gap-1 rounded-xl px-3 font-body text-[13px] font-semibold ${disabled ? "text-slate-600" : "text-slate-200 active:bg-hull-800"}`}>{direction === "left" && <ChevronLeft size={18} />}{label}{direction === "right" && <ChevronRight size={18} />}</button>;
}

function TimeBar({ hour, day, onHourChange, onOpenDayView }: { hour: number; day: ClaudeDayData; onHourChange: (hour: number) => void; onOpenDayView: () => void }) {
  const pillRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  useEffect(() => { pillRefs.current[hour]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }, [hour]);
  return <section className="px-4 pb-3 pt-2"><div className="flex items-center justify-between"><StepButton label="Prev Hour" direction="left" disabled={hour === 0} onClick={() => onHourChange(Math.max(0, hour - 1))} /><div className="text-center leading-tight"><p className="font-display text-[17px] font-bold tabular-nums text-white">{formatHour(hour)}</p><p className={`font-body text-[12px] font-medium ${day.hours[hour].solunar === "major" ? "text-tide-400" : day.hours[hour].solunar === "minor" ? "text-amber-300" : "text-slate-500"}`}>{solunarLabel(day.hours[hour].solunar)}</p></div><StepButton label="Next Hour" direction="right" disabled={hour === 23} onClick={() => onHourChange(Math.min(23, hour + 1))} /></div><div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">{day.hours.map(({ hour: value }) => <button key={value} ref={element => { pillRefs.current[value] = element; }} type="button" onClick={() => onHourChange(value)} aria-current={value === hour ? "time" : undefined} className={`flex h-8 shrink-0 items-center rounded-full px-3.5 font-body text-[13px] font-semibold ${value === hour ? "bg-tide-500 text-hull-950" : "border border-hull-700 bg-hull-800 text-slate-300"}`}>{formatHour(value)}</button>)}</div><button type="button" onClick={onOpenDayView} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-hull-700 bg-hull-800 font-body text-[13.5px] font-semibold text-slate-200"><Clock size={16} />View Full Day (24h)</button></section>;
}

function scoreBandTone(band: string) {
  if (band === "Peak" || band === "Strong") return { text: "text-tide-400", chip: "bg-tide-500/15 text-tide-400", stroke: "#4ADE9C" };
  if (band === "Favorable") return { text: "text-amber-300", chip: "bg-amber-400/15 text-amber-300", stroke: "#FCD34D" };
  return { text: "text-slate-300", chip: "bg-hull-700 text-slate-300", stroke: "#94A3B8" };
}

function ScoreCard({ day, hour }: { day: ClaudeDayData; hour: number }) {
  const values = day.hours.map(item => item.score);
  const min = Math.min(...values); const max = Math.max(...values); const current = day.hours[hour];
  const tone = scoreBandTone(current.scoreBand);
  const points = values.map((value, index) => `${index / (values.length - 1) * 280},${46 - (value - min) / (max - min || 1) * 46}`).join(" ");
  const nextPeak = day.hours.find(item => item.hour > hour && (item.scoreBand === "Peak" || item.scoreBand === "Strong"));
  return <article className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900"><div className="px-4 pb-3 pt-3"><div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400"><Fish size={13} className={tone.text} />Fishing score</div><div className="mt-1 flex items-center gap-3"><div className="flex flex-wrap items-baseline gap-2"><span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">{current.score}</span><span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${tone.chip}`}>{current.scoreBand}</span></div><svg viewBox="0 0 280 46" className="h-9 flex-1" preserveAspectRatio="none" aria-label="Fishing score trend"><polyline points={points} fill="none" stroke={tone.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".55" /><circle cx={hour / (values.length - 1) * 280} cy={46 - (current.score - min) / (max - min || 1) * 46} r="4.5" fill={tone.stroke} stroke="#070B13" strokeWidth="2" /></svg></div><div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2"><span className="font-body text-[13px] font-medium text-slate-300">{nextPeak ? "Next strong window" : "Based on tide + solunar"}</span><span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextPeak ? `${formatHour(nextPeak.hour)} (${nextPeak.score})` : "No stronger window today"}</span></div></div></article>;
}

function TideCard({ day, hour }: { day: ClaudeDayData; hour: number }) {
  const values = day.hours.map(item => item.tideHeight);
  const min = Math.min(...values); const max = Math.max(...values); const current = day.hours[hour];
  const nextEvent = day.tideEvents.find(event => event.hour >= hour) ?? day.tideEvents[0];
  const points = values.map((value, index) => `${index / (values.length - 1) * 280},${46 - (value - min) / (max - min || 1) * 46}`).join(" ");
  const rising = day.hours[Math.min(23, hour + 1)].tideHeight > current.tideHeight;
  return <article className="mx-4 mt-3 overflow-hidden rounded-3xl border border-hull-700/70 bg-gradient-to-b from-hull-800 to-hull-900"><div className="px-4 pb-3 pt-3"><div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400"><Waves size={13} className="text-tide-400" />Tide height</div><div className="mt-1 flex items-center gap-3"><div className="flex flex-wrap items-baseline gap-2"><span className="font-display text-[40px] font-bold leading-none tabular-nums text-white">{current.tideHeight.toFixed(1)}<span className="ml-0.5 align-top text-xl font-medium text-slate-400">m</span></span><span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${rising ? "bg-tide-500/15 text-tide-400" : "bg-amber-400/15 text-amber-300"}`}>{rising ? "Rising" : "Falling"}</span></div><svg viewBox="0 0 280 46" className="h-9 flex-1" preserveAspectRatio="none" aria-label="Tide height trend"><polyline points={points} fill="none" stroke="#22C58A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".55" /><circle cx={hour / (values.length - 1) * 280} cy={46 - (current.tideHeight - min) / (max - min || 1) * 46} r="4.5" fill="#4ADE9C" stroke="#070B13" strokeWidth="2" /></svg></div><div className="mt-1.5 flex items-center justify-between border-t border-hull-700/70 pt-2"><span className="font-body text-[13px] font-medium text-slate-300">Next {nextEvent.type.toLowerCase()} tide</span><span className="font-body text-[13px] font-semibold tabular-nums text-white">{nextEvent.type}: {formatHour(nextEvent.hour, true)} ({nextEvent.height.toFixed(1)}m)</span></div></div></article>;
}

function SolunarCard({ day, hour }: { day: ClaudeDayData; hour: number }) {
  const windows = [
    { type: "Major", start: day.majorWindow.start, end: day.majorWindow.end },
    ...day.minorWindows.map(window => ({ type: "Minor", start: window.start, end: window.end }))
  ];
  const activeWindow = windows.find(window => hour >= window.start && hour < window.end)
    ?? windows.find(window => window.start >= hour)
    ?? windows[0];
  return <article className="mx-4 mt-2 rounded-3xl border border-hull-700/70 bg-hull-800"><div className="px-4 pb-3 pt-3"><div className="flex items-center gap-1.5 font-body text-[12px] text-slate-400"><Moon size={13} className="text-indigo-300" />Solunar rating</div><div className="mt-1 flex flex-wrap items-baseline gap-2"><span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">{day.solunarRating}<span className="ml-0.5 align-top text-lg font-medium text-slate-400">%</span></span><span className="inline-flex items-center gap-1 rounded-full bg-tide-500/15 px-2.5 py-1 font-body text-xs font-semibold text-tide-400"><Fish size={14} />{ratingTier(day.solunarRating)}</span></div><div className="mt-2 flex items-center gap-2.5 border-t border-hull-700/70 pt-2"><Fish size={16} className="text-slate-300" /><div className="leading-tight"><p className="font-body text-[11.5px] text-slate-500">Active feeding window</p><p className="font-display text-[14px] font-semibold text-white">{activeWindow.type}: {formatHour(activeWindow.start, true)} - {formatHour(activeWindow.end, true)}</p></div></div></div></article>;
}

function MetricCard({ id, day, hour }: { id: MetricKey; day: ClaudeDayData; hour: number }) {
  const metric = metrics.find(item => item.id === id)!; const Icon = metric.icon; const wind = day.hours[hour].wind;
  const data: Record<MetricKey, [string, string, string]> = {
    wind: [`${wind.speed}`, "kts", `${wind.dir} · Gusts ${wind.gust} kts`], pressure: [`${day.secondary.pressure.value}`, "hPa", day.secondary.pressure.trend], waterTemp: [day.secondary.waterTemp, "°C", "Surface reading"], swell: [day.secondary.swell.height, "m", `@ ${day.secondary.swell.period}s ${day.secondary.swell.dir}`], moonPhase: [`${day.secondary.moon.illum}`, "%", day.secondary.moon.phaseName], rain: [`${day.secondary.rain.chance}`, "%", `${day.secondary.rain.mm.toFixed(1)}mm chance`], uv: [`${day.secondary.uv}`, "", uvLabel(day.secondary.uv)], airTemp: [`${day.secondary.airTemp.temp}`, "°C", `Feels ${day.secondary.airTemp.feels}°C`]
  };
  return <article className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800 p-3"><div className="flex items-center gap-2"><div className={`flex h-7 w-7 items-center justify-center rounded-full ${metric.ring}`}><Icon size={14} className={metric.tint} /></div><p className="font-body text-[11.5px] leading-tight text-slate-400">{metric.label}</p></div><div><p className="font-display text-[21px] font-bold leading-none tabular-nums text-white">{data[id][0]}<span className="ml-1 font-body text-[13px] font-medium text-slate-400">{data[id][1]}</span></p><p className="mt-1 truncate font-body text-[11px] text-slate-500">{data[id][2]}</p></div></article>;
}

function SettingsSheet({ open, settings, onClose, onToggle, onReset }: { open: boolean; settings: AnchoredSettingsState; onClose: () => void; onToggle: (metric: MetricKey) => void; onReset: () => void }) {
  return <><button type="button" aria-label="Close settings" onClick={onClose} className={`fixed inset-0 z-30 bg-black/60 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} /><section role="dialog" aria-modal="true" aria-label="Display settings" className={`fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-h-[85vh] max-w-md flex-col rounded-t-3xl border-t border-hull-700 bg-hull-900 transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}><div className="flex justify-center pt-3"><div className="h-1.5 w-10 rounded-full bg-hull-600" /></div><div className="flex items-center justify-between px-5 pb-1 pt-3"><h2 className="font-display text-lg font-semibold text-white">Customize display</h2><button type="button" onClick={onClose} aria-label="Close settings" className="flex h-12 w-12 items-center justify-center text-slate-400"><X size={22} /></button></div><p className="px-5 pb-2 font-body text-[13px] text-slate-500">Tide height and solunar rating always show.</p><div className="overflow-y-auto px-5">{metrics.map(metric => { const Icon = metric.icon; return <div key={metric.id} className="flex min-h-[56px] items-center justify-between border-b border-hull-700/70 py-3"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${metric.ring}`}><Icon size={17} className={metric.tint} /></div><span className="font-body text-[15px] font-medium text-white">{metric.label}</span></div><button type="button" role="switch" aria-checked={settings[metric.id]} aria-label={`Toggle ${metric.label}`} onClick={() => onToggle(metric.id)} className={`relative h-8 w-[52px] rounded-full ${settings[metric.id] ? "bg-tide-500" : "bg-hull-600"}`}><span className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${settings[metric.id] ? "translate-x-5" : ""}`} /></button></div>; })}</div><div className="flex gap-3 px-5 pb-6 pt-3"><button type="button" onClick={onReset} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-hull-600 font-body font-semibold text-slate-300"><RotateCcw size={16} />Reset</button><button type="button" onClick={onClose} className="h-12 flex-1 rounded-xl bg-tide-500 font-body font-semibold text-hull-950">Done</button></div></section></>;
}

function DayDrawer({ open, day, selectedHour, onClose, onPickHour }: { open: boolean; day: ClaudeDayData; selectedHour: number; onClose: () => void; onPickHour: (hour: number) => void }) {
  return <><button type="button" aria-label="Close full day view" onClick={onClose} className={`fixed inset-0 z-30 bg-black/60 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} /><section role="dialog" aria-modal="true" aria-label="Full day forecast" className={`fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-[82vh] max-w-md flex-col rounded-t-3xl border-t border-hull-700 bg-hull-900 transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}><div className="flex justify-center pt-3"><div className="h-1.5 w-10 rounded-full bg-hull-600" /></div><div className="flex items-center justify-between px-5 pb-2 pt-3"><div><h2 className="font-display text-lg font-semibold text-white">Full day forecast</h2><p className="font-body text-[12.5px] text-slate-500">Tap a row to jump there</p></div><button type="button" onClick={onClose} aria-label="Close full day view" className="flex h-12 w-12 items-center justify-center text-slate-400"><X size={22} /></button></div><div className="grid grid-cols-[64px_1fr_1.3fr_1.3fr] gap-2 border-b border-hull-700/70 px-5 py-2 font-body text-[11px] uppercase tracking-wide text-slate-500"><span>Time</span><span>Tide</span><span>Solunar</span><span>Wind</span></div><div className="flex-1 overflow-y-auto px-5 pb-4">{day.hours.map(item => <button key={item.hour} type="button" onClick={() => { onPickHour(item.hour); onClose(); }} className={`grid min-h-[48px] w-full grid-cols-[64px_1fr_1.3fr_1.3fr] items-center gap-2 border-b border-hull-700/50 py-3 text-left ${item.hour === selectedHour ? "bg-tide-500/10" : ""}`}><span className={`font-body text-[13px] font-semibold tabular-nums ${item.hour === selectedHour ? "text-tide-400" : "text-white"}`}>{formatHour(item.hour)}</span><span className="font-body text-[13px] tabular-nums text-slate-300">{item.tideHeight.toFixed(1)}m</span><span className="font-body text-[12.5px] text-slate-400">{item.solunar === "none" ? "-" : item.solunar}</span><span className="font-body text-[12.5px] tabular-nums text-slate-300">{item.wind.speed}kt {item.wind.dir}</span></button>)}</div></section></>;
}

export default function FishOnDashboard() {
  const { settings, toggleMetric, resetSettings } = useAnchoredSettings();
  const [offset, setOffset] = useState(0); const [hour, setHour] = useState(DEFAULT_HOUR); const [settingsOpen, setSettingsOpen] = useState(false); const [dayViewOpen, setDayViewOpen] = useState(false);
  const day = useMemo(() => generateClaudeDayData(offset), [offset]);
  return <main className="min-h-screen max-w-md mx-auto bg-hull-950 pb-10 font-body"><div className="sticky top-0 z-20 border-b border-hull-700/60 bg-hull-950/95 backdrop-blur"><header className="flex h-14 items-center justify-between px-4"><div className="flex min-w-0 items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-tide-500/15 text-tide-400"><Fish size={16} /></div><div className="min-w-0"><p className="font-body text-[10px] text-slate-500">Fish On · Current spot</p><h1 className="truncate font-display text-[16px] font-semibold text-white">Mooloolaba River Mouth</h1></div></div><button type="button" onClick={() => setSettingsOpen(true)} aria-label="Open display settings" className="flex h-10 w-10 items-center justify-center text-slate-300"><Settings size={21} /></button></header><div className="border-t border-hull-700/60 px-2 py-1"><div className="flex items-center justify-between"><StepButton label="Prev Day" direction="left" onClick={() => setOffset(offset - 1)} /><div className="flex items-center gap-1.5 font-body text-[14px] font-semibold text-white"><Calendar size={14} className="text-slate-500" />{formatDate(offset)}</div><StepButton label="Next Day" direction="right" onClick={() => setOffset(offset + 1)} /></div></div><TimeBar hour={hour} day={day} onHourChange={setHour} onOpenDayView={() => setDayViewOpen(true)} /></div><ScoreCard day={day} hour={hour} /><TideCard day={day} hour={hour} /><SolunarCard day={day} hour={hour} /><section className="mt-3 px-4"><div className="grid grid-cols-2 gap-3">{metrics.filter(metric => settings[metric.id]).map(metric => <MetricCard key={metric.id} id={metric.id} day={day} hour={hour} />)}</div></section><DayDrawer open={dayViewOpen} day={day} selectedHour={hour} onClose={() => setDayViewOpen(false)} onPickHour={setHour} /><SettingsSheet open={settingsOpen} settings={settings} onClose={() => setSettingsOpen(false)} onToggle={toggleMetric} onReset={resetSettings} /></main>;
}
