import type { LucideIcon } from "lucide-react";
import {
  CloudRain,
  Compass,
  Droplets,
  Gauge,
  Moon,
  Sun,
  Thermometer,
  Wind
} from "lucide-react";
import type { SecondaryMetrics } from "../../data/mockMarineData";
import type { AnchoredSettingsState } from "../../hooks/useAnchoredSettings";

export interface SecondaryMetricGridProps {
  settings: AnchoredSettingsState;
  metricData: SecondaryMetrics;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  iconClassName?: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  iconClassName = "text-cyan-300"
}: MetricCardProps) {
  return (
    <article className="flex min-h-[112px] flex-col justify-between rounded-2xl border border-hull-700/70 bg-hull-800 p-4 shadow-lg">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={18} className={iconClassName} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="mt-4 min-w-0">
        <p className="font-display truncate text-[26px] font-bold leading-none text-white">{value}</p>
        <p className="mt-1 truncate text-sm text-slate-400">{detail}</p>
      </div>
    </article>
  );
}

export default function SecondaryMetricGrid({
  settings,
  metricData
}: SecondaryMetricGridProps) {
  const cards = [
    settings.wind && (
      <MetricCard
        key="wind"
        icon={Wind}
        label="Wind"
        value={`${metricData.wind.speed} ${metricData.wind.unit}`}
        detail={`${metricData.wind.direction} · Gusts ${metricData.wind.gusts} ${metricData.wind.unit}`}
      />
    ),
    settings.pressure && (
      <MetricCard
        key="pressure"
        icon={Gauge}
        label="Barometric Pressure"
        value={`${metricData.pressure.value} ${metricData.pressure.unit}`}
        detail={metricData.pressure.trend}
      />
    ),
    settings.waterTemp && (
      <MetricCard
        key="waterTemp"
        icon={Thermometer}
        label="Water Temperature"
        value={`${metricData.waterTemp.value}${metricData.waterTemp.unit}`}
        detail="Surface water"
      />
    ),
    settings.swell && (
      <MetricCard
        key="swell"
        icon={Droplets}
        label="Swell / Waves"
        value={`${metricData.swell.height}${metricData.swell.heightUnit}`}
        detail={`${metricData.swell.direction} · ${metricData.swell.period}${metricData.swell.periodUnit} period`}
      />
    ),
    settings.moonPhase && (
      <MetricCard
        key="moonPhase"
        icon={Moon}
        label="Moon Phase"
        value={metricData.moonPhase.phase}
        detail={`${metricData.moonPhase.illumination}% illuminated`}
        iconClassName="text-indigo-300"
      />
    ),
    settings.rain && (
      <MetricCard
        key="rain"
        icon={CloudRain}
        label="Rain"
        value={`${metricData.rain.chance}% chance`}
        detail={`${metricData.rain.volume} ${metricData.rain.volumeUnit} volume`}
        iconClassName="text-sky-300"
      />
    ),
    settings.uv && (
      <MetricCard
        key="uv"
        icon={Sun}
        label="UV Index"
        value={`${metricData.uv.index}`}
        detail={metricData.uv.level}
        iconClassName="text-amber-300"
      />
    ),
    settings.airTemp && (
      <MetricCard
        key="airTemp"
        icon={Compass}
        label="Air Temp"
        value={`${metricData.airTemp.value}${metricData.airTemp.unit}`}
        detail={`Feels like ${metricData.airTemp.feelsLike}${metricData.airTemp.unit}`}
        iconClassName="text-orange-300"
      />
    )
  ].filter(Boolean);

  return (
    <section
      className="grid grid-cols-2 gap-3"
      aria-label="Secondary marine metrics"
    >
      {cards}
    </section>
  );
}
