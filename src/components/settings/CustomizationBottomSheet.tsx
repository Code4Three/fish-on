import { useEffect } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { DashboardCardSettings } from "../../hooks/useAnchoredSettings";
import type { DockPosition } from "../../hooks/useDashboardSettings";
import { PROTOTYPE_OPTIONS } from "../../hooks/useLayoutPrototype";
import type { PrototypeId } from "../../hooks/useLayoutPrototype";

export interface CustomizationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DashboardCardSettings;
  onToggle: (card: keyof DashboardCardSettings) => void;
  onReset: () => void;
  prototype: PrototypeId;
  onSelectPrototype: (id: PrototypeId) => void;
  dockPosition?: DockPosition;
  onSelectDockPosition?: (position: DockPosition) => void;
}

const METRIC_OPTIONS: Array<{
  key: keyof DashboardCardSettings;
  label: string;
  description: string;
}> = [
  { key: "temperature", label: "Temperature", description: "Water and air temperature" },
  { key: "weather", label: "Weather", description: "Wind, rain, cloud, and UV" },
  { key: "moon", label: "Moon", description: "Phase, illumination, moonrise, and moonset" },
  { key: "sun", label: "Sun", description: "Sunrise, sunset, and light windows" },
  { key: "swell", label: "Swell", description: "Height, direction, and period" }
];

export default function CustomizationBottomSheet({
  isOpen,
  onClose,
  settings,
  onToggle,
  onReset,
  prototype,
  onSelectPrototype,
  dockPosition,
  onSelectDockPosition
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
            Display Metrics
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
          {METRIC_OPTIONS.map(({ key, label, description }) => {
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

        <div className="border-t border-slate-800 px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-white">Dashboard layout</p>
          <div className="grid gap-2">
            {PROTOTYPE_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                aria-pressed={prototype === option.id}
                onClick={() => onSelectPrototype(option.id)}
                tabIndex={isOpen ? 0 : -1}
                className={`flex min-h-12 items-center justify-between rounded-lg border px-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  prototype === option.id
                    ? "border-emerald-300 bg-emerald-400/15 text-emerald-200"
                    : "border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="block text-xs text-slate-400">{option.description}</span>
                </span>
                {prototype === option.id && <Check size={18} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        {dockPosition && onSelectDockPosition && (
          <div className="border-t border-slate-800 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-white">Control dock</p>
            <div className="grid grid-cols-2 gap-2">
              {(["bottom", "top"] as const).map(position => (
                <button
                  key={position}
                  type="button"
                  aria-pressed={dockPosition === position}
                  onClick={() => onSelectDockPosition(position)}
                  tabIndex={isOpen ? 0 : -1}
                  className={`min-h-12 rounded-lg border text-sm font-semibold capitalize transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    dockPosition === position
                      ? "border-emerald-300 bg-emerald-400/15 text-emerald-200"
                      : "border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>
        )}

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
