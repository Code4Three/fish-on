import { useEffect } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { AnchoredSettingsState } from "../../hooks/useAnchoredSettings";
import { PROTOTYPE_OPTIONS, type PrototypeId } from "../../hooks/useLayoutPrototype";

export interface CustomizationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AnchoredSettingsState;
  onToggle: (metric: keyof AnchoredSettingsState) => void;
  onReset: () => void;
  prototype: PrototypeId;
  onSelectPrototype: (id: PrototypeId) => void;
  showMetricsSection?: boolean;
}

const METRIC_OPTIONS: Array<{
  key: keyof AnchoredSettingsState;
  label: string;
  description: string;
}> = [
  { key: "wind", label: "Wind", description: "Speed, direction, and gusts" },
  { key: "pressure", label: "Barometric pressure", description: "Pressure and trend" },
  { key: "waterTemp", label: "Water temperature", description: "Surface water temperature" },
  { key: "swell", label: "Swell / waves", description: "Height, direction, and period" },
  { key: "moonPhase", label: "Moon phase", description: "Phase and illumination" },
  { key: "rain", label: "Rain", description: "Chance and expected volume" },
  { key: "uv", label: "UV index", description: "UV exposure level" },
  { key: "airTemp", label: "Air temperature", description: "Temperature and feels like" }
];

export default function CustomizationBottomSheet({
  isOpen,
  onClose,
  settings,
  onToggle,
  onReset,
  prototype,
  onSelectPrototype,
  showMetricsSection = true
}: CustomizationBottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Close display metrics"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="display-metrics-title"
        className={`relative w-full max-w-md rounded-t-3xl border border-b-0 border-hull-700 bg-hull-900 font-body text-slate-100 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-slate-800 px-4">
          <h2 id="display-metrics-title" className="text-lg font-bold text-white">
            Dashboard Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            aria-label="Close display metrics"
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-4 py-2">
          <div className="border-b border-slate-800/80 pb-3">
            <p className="px-0 pb-2 pt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Dashboard Layout</p>
            <div className="space-y-2">
              {PROTOTYPE_OPTIONS.map(option => {
                const active = option.id === prototype;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => onSelectPrototype(option.id)}
                    className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                      active ? "border-emerald-300 bg-emerald-400/10" : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
                    }`}
                  >
                    <span className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">{option.label}</p>
                      <p className="truncate text-xs text-slate-400">{option.description}</p>
                    </span>
                    {active && <Check size={20} className="shrink-0 text-emerald-300" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          {showMetricsSection && METRIC_OPTIONS.map(({ key, label, description }) => {
            const enabled = settings[key];

            return (
              <div
                key={key}
                className="flex min-h-[52px] items-center justify-between gap-4 border-b border-slate-800/80 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">{label}</p>
                  <p className="truncate text-xs text-slate-400">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${enabled ? "Hide" : "Show"} ${label}`}
                  onClick={() => onToggle(key)}
                  tabIndex={isOpen ? 0 : -1}
                  className={`inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    enabled
                      ? "border-emerald-300 bg-emerald-400 text-slate-950"
                      : "border-slate-600 bg-slate-800 text-slate-500"
                  }`}
                >
                  <Check size={19} strokeWidth={3} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={onReset}
            tabIndex={isOpen ? 0 : -1}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <RotateCcw size={18} aria-hidden="true" />
            Reset to Defaults
          </button>
        </div>
      </section>
    </div>
  );
}
