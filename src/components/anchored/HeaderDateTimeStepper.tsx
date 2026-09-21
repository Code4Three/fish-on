import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings
} from "lucide-react";

export interface HourOption {
  value: string;
  label: string;
}

export interface HeaderDateTimeStepperProps {
  currentDate: Date;
  currentHour: string;
  currentHourLabel?: string;
  hours?: HourOption[];
  onDateChange: (date: Date) => void;
  onHourChange: (hour: string) => void;
  onOpenSettings: () => void;
  onOpenFullDay: () => void;
}

const DEFAULT_HOURS: HourOption[] = [
  { value: "05:00", label: "5:00 AM" },
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" }
];

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short"
});

function shiftDate(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDate(date: Date) {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return `${isToday ? "Today, " : ""}${dateFormatter.format(date)}`;
}

export default function HeaderDateTimeStepper({
  currentDate,
  currentHour,
  currentHourLabel = "Major Solunar Window",
  hours = DEFAULT_HOURS,
  onDateChange,
  onHourChange,
  onOpenSettings,
  onOpenFullDay
}: HeaderDateTimeStepperProps) {
  const currentHourIndex = hours.findIndex(hour => hour.value === currentHour);
  const previousHour = hours[currentHourIndex - 1];
  const nextHour = hours[currentHourIndex + 1];

  return (
    <section className="w-full bg-slate-900/95 text-slate-100 shadow-lg">
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-3">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <p className="truncate text-base font-semibold tracking-tight">
            Mooloolaba River Mouth
          </p>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open anchored settings"
            className="inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg text-slate-100 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <Settings size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-12 items-center justify-between gap-2 border-y border-slate-700 py-1">
          <button
            type="button"
            onClick={() => onDateChange(shiftDate(currentDate, -1))}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            <span>Prev Day</span>
          </button>
          <div className="flex min-w-0 items-center gap-2 text-center font-semibold">
            <Calendar size={18} className="shrink-0 text-cyan-300" aria-hidden="true" />
            <span className="truncate">{formatDate(currentDate)}</span>
          </div>
          <button
            type="button"
            onClick={() => onDateChange(shiftDate(currentDate, 1))}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <span>Next Day</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-12 items-center justify-between gap-2">
          <button
            type="button"
            disabled={!previousHour}
            onClick={() => previousHour && onHourChange(previousHour.value)}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Prev Hour</span>
          </button>
          <div className="flex min-w-0 items-center gap-2 text-center">
            <Clock size={18} className="shrink-0 text-cyan-300" aria-hidden="true" />
            <span className="truncate text-sm font-semibold">
              {hours.find(hour => hour.value === currentHour)?.label ?? currentHour} - {currentHourLabel}
            </span>
          </div>
          <button
            type="button"
            disabled={!nextHour}
            onClick={() => nextHour && onHourChange(nextHour.value)}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="sr-only sm:not-sr-only">Next Hour</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Hourly forecast">
          {hours.map(hour => (
            <button
              key={hour.value}
              type="button"
              onClick={() => onHourChange(hour.value)}
              aria-current={hour.value === currentHour ? "time" : undefined}
              className={`min-h-12 shrink-0 rounded-full border px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                hour.value === currentHour
                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
              }`}
            >
              {hour.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenFullDay}
          className="min-h-12 w-full rounded-lg border border-slate-600 px-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          View Full Day (24h)
        </button>
      </div>
    </section>
  );
}
