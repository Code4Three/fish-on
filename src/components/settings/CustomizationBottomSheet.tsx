import { useEffect } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { DAILY_GROUPS, HOURLY_METRICS } from "../../config/metricMatrix";
import type {
  DashboardCardSettings,
  MatrixSettings,
} from "../../hooks/useAnchoredSettings";
import type { DockPosition } from "../../hooks/useDashboardSettings";
import { PROTOTYPE_OPTIONS } from "../../hooks/useLayoutPrototype";
import type { PrototypeId } from "../../hooks/useLayoutPrototype";

export interface CustomizationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DashboardCardSettings;
  onToggle: (card: keyof DashboardCardSettings) => void;
  matrixSettings?: MatrixSettings;
  onToggleGroup?: (group: string) => void;
  onToggleMatrixMetric?: (metric: string, hourly?: boolean) => void;
  onReset: () => void;
  prototype: PrototypeId;
  onSelectPrototype: (id: PrototypeId) => void;
  dockPosition?: DockPosition;
  onSelectDockPosition?: (position: DockPosition) => void;
}

export default function CustomizationBottomSheet({
  isOpen,
  onClose,
  settings,
  onToggle,
  matrixSettings,
  onToggleGroup,
  onToggleMatrixMetric,
  onReset,
  prototype,
  onSelectPrototype,
  dockPosition,
  onSelectDockPosition,
}: CustomizationBottomSheetProps) {
  // Let Escape close the sheet while it's open
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
      {/* Full-screen backdrop */}
      <button
        type="button"
        aria-label="Close display metrics"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Layout wrapper aligned with <main> */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-screen-2xl px-0 sm:px-4 lg:px-16">
        {/* Modal sheet */}
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="display-metrics-title"
          className={`pointer-events-auto relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-b-0 border-hull-700 bg-hull-900 font-body text-slate-100 shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex min-h-16 items-center justify-between border-b border-slate-800 px-4">
            <h2
              id="display-metrics-title"
              className="text-lg font-bold text-white"
            >
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

          {/* ================= METRIC VISIBILITY TOGGLES ================= */}
          <div className="px-4 py-2">
            {matrixSettings && onToggleGroup && onToggleMatrixMetric ? (
              <>
                {/* Daily dashboard groups + their individual metrics, collapsible */}
                <details className="border-b border-slate-800/80">
                  <summary className="cursor-pointer py-3 text-sm font-semibold text-white">
                    Dashboard display
                  </summary>
                  {matrixSettings.heroOrder.map((groupId) => {
                    const group = DAILY_GROUPS.find(
                      (item) => item.id === groupId,
                    );
                    if (!group) return null;

                    return (
                      <div
                        key={group.id}
                        className="border-t border-slate-800/80 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 text-sm font-semibold text-slate-100">
                            {group.label}
                          </p>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={matrixSettings.groups[group.id]}
                            aria-label={`${matrixSettings.groups[group.id] ? "Hide" : "Show"} ${group.label}`}
                            onClick={() => onToggleGroup(group.id)}
                            tabIndex={isOpen ? 0 : -1}
                            className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border ${
                              matrixSettings.groups[group.id]
                                ? "border-emerald-300 bg-emerald-400 text-slate-950"
                                : "border-slate-600 bg-slate-800 text-slate-500"
                            }`}
                          >
                            <Check size={17} strokeWidth={3} />
                          </button>
                        </div>
                        <div className="ml-6 mt-1">
                          {group.metrics.map((metric) => (
                            <div
                              key={`${group.id}-${metric.id}`}
                              className="flex min-h-10 items-center gap-2"
                            >
                              <span className="min-w-0 flex-1 text-xs text-slate-400">
                                {metric.label}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={matrixSettings.metrics[metric.id]}
                                aria-label={`${matrixSettings.metrics[metric.id] ? "Hide" : "Show"} ${metric.label}`}
                                onClick={() => onToggleMatrixMetric(metric.id)}
                                tabIndex={isOpen ? 0 : -1}
                                className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border ${
                                  matrixSettings.metrics[metric.id]
                                    ? "border-emerald-300 bg-emerald-400 text-slate-950"
                                    : "border-slate-600 bg-slate-800 text-slate-500"
                                }`}
                              >
                                <Check size={15} strokeWidth={3} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </details>

                {/* Metrics shown in the hourly detail drawer, toggled independently of the daily groups */}
                <details className="border-b border-slate-800/80">
                  <summary className="cursor-pointer py-3 text-sm font-semibold text-white">
                    Hourly display
                  </summary>
                  {HOURLY_METRICS.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex min-h-10 items-center justify-between gap-3 border-t border-slate-800/80"
                    >
                      <span className="text-xs text-slate-400">
                        {metric.label}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={matrixSettings.hourly[metric.id]}
                        aria-label={`${matrixSettings.hourly[metric.id] ? "Hide" : "Show"} ${metric.label}`}
                        onClick={() => onToggleMatrixMetric(metric.id, true)}
                        tabIndex={isOpen ? 0 : -1}
                        className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border ${
                          matrixSettings.hourly[metric.id]
                            ? "border-emerald-300 bg-emerald-400 text-slate-950"
                            : "border-slate-600 bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Check size={15} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </details>
              </>
            ) : (
              // Fallback for prototypes that only support the simpler flat card toggles
              Object.entries(settings).map(([key, enabled]) => (
                <div
                  key={key}
                  className="flex min-h-[52px] items-center justify-between border-b border-slate-800/80 py-2"
                >
                  <p className="text-sm font-semibold capitalize text-slate-100">
                    {key}
                  </p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => onToggle(key as keyof DashboardCardSettings)}
                    tabIndex={isOpen ? 0 : -1}
                    className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border ${
                      enabled
                        ? "border-emerald-300 bg-emerald-400 text-slate-950"
                        : "border-slate-600 bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Check size={19} strokeWidth={3} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ================= LAYOUT PROTOTYPE PICKER ================= */}
          <div className="border-t border-slate-800 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-white">
              Dashboard layout
            </p>
            <div className="grid gap-2">
              {PROTOTYPE_OPTIONS.map((option) => (
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
                    <span className="block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {option.description}
                    </span>
                  </span>
                  {prototype === option.id && (
                    <Check size={18} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ================= DOCK POSITION PICKER (CONDITIONAL) ================= */}
          {dockPosition && onSelectDockPosition && (
            <div className="border-t border-slate-800 px-4 py-3">
              <p className="mb-2 text-sm font-semibold text-white">
                Control dock
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["bottom", "top"] as const).map((position) => (
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

          {/* ================= RESET ================= */}
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
    </div>
  );
}
