import {
  ArrowUpRight,
  ShieldAlert,
  Sun,
  Waves
} from "lucide-react";
import type { AnchoredMetrics } from "../../data/mockMarineData";

export interface TideEventSummary {
  time: string;
  height?: number;
  type: "High" | "Low";
}

export interface AnchoredHeroSectionProps {
  primaryMetrics: AnchoredMetrics;
  nextHighTide?: TideEventSummary;
  nextLowTide?: TideEventSummary;
  feedingWindow?: string;
}

function formatHeight(height: number, unit: string) {
  return `${height}${unit}`;
}

function getTideStatus(direction: AnchoredMetrics["primaryTide"]["direction"]) {
  if (direction === "incoming") return "Rising";
  if (direction === "outgoing") return "Falling";
  return "Slack";
}

function getSolunarRating(score: number) {
  if (score >= 80) return "Peak";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Favourable";
  return "Low";
}

function renderTideEvent(event: TideEventSummary | undefined, fallback: string) {
  if (!event) return fallback;

  const height = event.height == null ? "" : `, ${event.height}m`;
  return `${event.type} ${event.time}${height}`;
}

export default function AnchoredHeroSection({
  primaryMetrics,
  nextHighTide,
  nextLowTide,
  feedingWindow
}: AnchoredHeroSectionProps) {
  const { primaryTide, primarySolunar } = primaryMetrics;
  const tideStatus = getTideStatus(primaryTide.direction);
  const solunarRating = getSolunarRating(primarySolunar.score);

  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label="Primary marine conditions">
      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Primary Tide
            </p>
            <div className="mt-3 flex items-center gap-2 text-cyan-300">
              <Waves size={24} aria-hidden="true" />
              <span className="text-4xl font-bold tracking-tight text-white">
                {formatHeight(primaryTide.height, primaryTide.unit)}
              </span>
              <span className="text-lg font-semibold">{tideStatus}</span>
            </div>
          </div>
          <ArrowUpRight className="text-cyan-300" size={24} aria-hidden="true" />
        </div>

        <div className="mt-5 space-y-1 border-t border-slate-800 pt-3 text-sm text-slate-300">
          <p>{renderTideEvent(nextHighTide, "Next high tide unavailable")}</p>
          <p>{renderTideEvent(nextLowTide, "Next low tide unavailable")}</p>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Primary Solunar
            </p>
            <div className="mt-3 flex items-center gap-2 text-emerald-300">
              <Sun size={24} aria-hidden="true" />
              <span className="text-4xl font-bold tracking-tight text-white">
                {primarySolunar.score}%
              </span>
              <span className="text-lg font-semibold">{solunarRating}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
            <ShieldAlert size={14} aria-hidden="true" />
            Active
          </span>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-3 text-sm text-slate-200">
          <p className="font-semibold text-emerald-300">
            {feedingWindow ?? `${primarySolunar.condition} - ${primarySolunar.peak ?? "No peak time"}`}
          </p>
          <p className="mt-1 text-slate-400">Feeding window</p>
        </div>
      </article>
    </section>
  );
}
