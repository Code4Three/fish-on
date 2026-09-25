import { useRef, useState } from "react";
import { Fish, Settings, Waves } from "lucide-react";
import { DAILY_GROUPS } from "../config/metricMatrix";
import { useAnchoredSettings } from "../hooks/useAnchoredSettings";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import CustomizationBottomSheet from "./settings/CustomizationBottomSheet";
import type { DashboardStateProps } from "./prototypes/shared";
import {
  DayDrawer,
  FullConditionsView,
  HourPills,
  MatrixGroupCard,
  MatrixMetricCard,
  StepButton,
  formatDate,
  formatTideHeight,
  isTideRising,
  ratingTier,
} from "./prototypes/shared";

// ==========================================
// SUB-COMPONENT: Floating Navigation Dock
// ==========================================
// Floating date/hour control bar that docks to the top or bottom of the screen.
// Dragging its handle reveals the full 24h drawer (expansionProgress 0-1 drives that reveal).
function DashboardDock({
  position,
  offset,
  hour,
  day,
  canGoPrevious,
  canGoNext,
  onOffsetChange,
  onHourChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  expansionProgress,
  isDragging,
}: {
  position: "bottom" | "top";
  offset: number;
  hour: number;
  day: DashboardStateProps["day"];
  canGoPrevious: boolean;
  canGoNext: boolean;
  onOffsetChange: (offset: number) => void;
  onHourChange: (hour: number) => void;
  onDragStart: (startY: number) => void;
  onDragMove: (currentY: number) => void;
  onDragEnd: () => void;
  expansionProgress: number;
  isDragging: boolean;
}) {
  const isBottom = position === "bottom";
  const isExpanded = expansionProgress > 0;

  // Placement classes: pinned bottom, expanded-to-fixed-top, or sticky-top
  const positionClasses = isBottom
    ? "w-full bottom-0 left-0 right-0 z-40 pb-8"
    : isExpanded
      ? "fixed left-0 right-0 z-40"
      : "sticky top-[72px] z-40";

  return (
    // fixed/sticky already establish a containing block, so no extra `relative` is needed (and it would override them in Tailwind's cascade)
    <div
      className={`${positionClasses} select-none bg-hull-950/75 px-4 pb-4 pt-3 backdrop-blur ${
        isDragging
          ? ""
          : "transition-[bottom,top,transform] duration-300 ease-out"
      }`}
    >
      {/* Drag handle: swipe toward the screen edge to open the full day drawer */}
      <div
        className={`absolute inset-x-1 z-10 flex h-12 cursor-grab touch-none items-center justify-center active:cursor-grabbing ${
          isBottom ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
        }`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onDragStart(event.clientY);
        }}
        onPointerMove={(event) => onDragMove(event.clientY)}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        aria-label={`${isBottom ? "Bottom" : "Top"} dashboard dock. Swipe ${isBottom ? "up" : "down"} for the full day forecast.`}
      >
        <div className="h-1 w-10 rounded-full bg-hull-600/90" />
      </div>

      {/* Prev/next day navigation with the current date label */}
      <div className="flex items-center justify-between gap-1">
        <StepButton
          label="Prev Day"
          direction="left"
          disabled={!canGoPrevious}
          onClick={() => onOffsetChange(offset - 1)}
        />
        <span className="min-h-12 flex-1 truncate bg-transparent px-2 text-center font-body text-[13px] font-semibold leading-[48px] text-white">
          {formatDate(day.date)}
        </span>
        <StepButton
          label="Next Day"
          direction="right"
          disabled={!canGoNext}
          onClick={() => onOffsetChange(offset + 1)}
        />
      </div>

      {/* Scrollable hour-of-day picker */}
      <div className="mt-2">
        <HourPills hour={hour} day={day} onHourChange={onHourChange} />
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT: Dashboard Shell
// ==========================================
// Production dashboard: bottom-dock thumb-first layout (formerly Prototype 1). Settings live in the header only.
export default function MainDashboard({
  day,
  hour,
  offset,
  canGoPrevious,
  canGoNext,
  onHourChange,
  onOffsetChange,
  prototype,
  onSelectPrototype,
}: DashboardStateProps) {
  // Which cards/groups/metrics are visible and in what order, persisted per user
  const {
    cardSettings,
    matrixSettings,
    toggleCard,
    toggleGroup,
    toggleMatrixMetric,
    moveDashboardItem,
    resetSettings,
  } = useAnchoredSettings();
  // Whether the control dock sits at the top or bottom of the screen
  const { dockPosition, selectDockPosition } = useDashboardSettings();
  // Dialog visibility: display-options sheet and the full-day drawer
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);
  // 0-1 reveal progress for the day drawer, driven by dragging the dock handle
  const [drawerProgress, setDrawerProgress] = useState(0);
  const [drawerDragging, setDrawerDragging] = useState(false);
  // 0-1 horizontal position of the cards/full-conditions swipe panel (0 = cards, 1 = full conditions)
  const [conditionsProgress, setConditionsProgress] = useState(0);
  const [conditionsDragging, setConditionsDragging] = useState(false);
  // Drag bookkeeping (not reactive state, just refs to compare against on move/end)
  const dragStartY = useRef<number | null>(null);
  const dragStartProgress = useRef(0);
  const conditionsStartX = useRef<number | null>(null);
  const conditionsStartY = useRef<number | null>(null);
  const conditionsStartProgress = useRef(0);

  const current = day.hours[hour];
  const rising = isTideRising(day, hour);

  // Begin dragging the dock handle to open/close the day drawer
  const handleDockDragStart = (startY: number) => {
    dragStartY.current = startY;
    dragStartProgress.current = drawerProgress;
    setDrawerDragging(true);
  };

  // Convert vertical drag distance into drawer reveal progress (0-1)
  const handleDockDragMove = (currentY: number) => {
    if (dragStartY.current === null) return;
    const deltaY = currentY - dragStartY.current;
    const travel = Math.max(1, window.innerHeight - 72 - 132);
    const progressDelta =
      dockPosition === "bottom" ? -deltaY / travel : deltaY / travel;
    setDrawerProgress(
      Math.max(0, Math.min(1, dragStartProgress.current + progressDelta)),
    );
  };

  // Snap the drawer fully open or closed based on how far it was dragged
  const handleDockDragEnd = () => {
    if (dragStartY.current === null) return;
    const shouldOpen = drawerProgress >= 0.5;
    setDrawerProgress(shouldOpen ? 1 : 0);
    setDayViewOpen(shouldOpen);
    setDrawerDragging(false);
    dragStartY.current = null;
  };

  // Begin tracking a horizontal swipe on the cards/full-conditions panel
  const handleConditionsPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.pointerType === "touch") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    conditionsStartX.current = event.clientX;
    conditionsStartY.current = event.clientY;
    conditionsStartProgress.current = conditionsProgress;
  };

  // Track the swipe once it's confirmed horizontal, updating panel position live
  const handleConditionsPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (conditionsStartX.current === null || conditionsStartY.current === null)
      return;
    const deltaX = event.clientX - conditionsStartX.current;
    const deltaY = event.clientY - conditionsStartY.current;

    if (!conditionsDragging) {
      // Ignore mostly-vertical gestures so vertical scrolling still works
      if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 8) return;
      if (deltaX > 0 && conditionsStartProgress.current === 0) return;
      if (deltaX < 0 && conditionsStartProgress.current === 1) return;
      if (event.pointerType !== "touch") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      setConditionsDragging(true);
    }

    event.preventDefault();
    const travel = Math.max(1, event.currentTarget.clientWidth);
    const progressDelta = -deltaX / travel;
    setConditionsProgress(
      Math.max(0, Math.min(1, conditionsStartProgress.current + progressDelta)),
    );
  };

  // Snap the swipe panel to whichever side (cards or full conditions) it's closer to
  const handleConditionsPointerEnd = () => {
    if (conditionsStartX.current === null) return;
    setConditionsProgress((current) => (current >= 0.5 ? 1 : 0));
    setConditionsDragging(false);
    conditionsStartX.current = null;
    conditionsStartY.current = null;
  };

  // Handle drag-and-drop reordering of hero groups / metric cards
  const handleDashboardDrop = (
    event: React.DragEvent<HTMLElement>,
    target: string,
    area: "heroOrder" | "cardOrder",
  ) => {
    event.preventDefault();
    const sourceArea = event.dataTransfer.getData("text/area");
    const source = event.dataTransfer.getData("text/id");
    if (sourceArea === area) moveDashboardItem(source, target, area);
  };

  // Pre-flatten metric definitions once so the card grid doesn't re-flatten on every lookup
  const allMetrics = DAILY_GROUPS.flatMap((group) => group.metrics);

  // Bundle the props shared by both the top and bottom dock instances
  const dockProps = {
    offset,
    hour,
    day,
    canGoPrevious,
    canGoNext,
    onOffsetChange,
    onHourChange,
    onDragStart: handleDockDragStart,
    onDragMove: handleDockDragMove,
    onDragEnd: handleDockDragEnd,
    expansionProgress: drawerProgress,
    isDragging: drawerDragging,
  };

  return (
    // Centers the fixed-width mobile column within any wider viewport
    <div className="flex min-h-screen w-full mx-auto px-0 sm:px-4 lg:px-16 max-w-screen-2xl justify-center bg-hull-950">
      <main className="dashboard-shell overscroll-x-none relative w-full mx-auto flex h-[100dvh] min-h-[100svh] flex-col overflow-hidden bg-hull-950 font-body touch-pan-y">
        {/* ================= HEADER ================= */}
        {/* Header: location name, current tide/solunar summary, and the settings button */}
        <header className="sticky top-0 z-20 shrink-0 bg-hull-950/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tide-500/15 text-tide-400">
                <Fish size={16} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-display text-[16px] font-semibold text-white">
                  Mooloolaba River Mouth
                </h1>
                <p className="flex items-center gap-1.5 truncate font-body text-[12px] text-slate-400">
                  <Waves size={12} className="shrink-0 text-tide-400" />
                  {formatTideHeight(current.tideHeight)}m{" "}
                  {rising ? "rising" : "falling"} ·{" "}
                  {ratingTier(day.solunarRating)} solunar
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

        {/* ================= TOP DOCK (CONDITIONAL) ================= */}
        {/* Top dock: only rendered when the user has chosen the top-docked control layout */}
        {dockPosition === "top" && (
          <DashboardDock position="top" {...dockProps} />
        )}

        {/* ================= SWIPEABLE MAIN PANEL ================= */}
        {/* Swipeable panel: metric cards on the left, full conditions detail on the right. From md+ (tablet) up, both panels sit side by side instead of swiping. */}
        <div
          className={`mx-auto w-full overscroll-x-none min-h-0 flex-1 overflow-hidden ${dockPosition === "top" ? "pb-4" : ""} ${conditionsDragging ? "touch-none" : "touch-pan-y"}`}
          onPointerDown={handleConditionsPointerDown}
          onPointerMove={handleConditionsPointerMove}
          onPointerUp={handleConditionsPointerEnd}
          onPointerCancel={handleConditionsPointerEnd}
          onLostPointerCapture={handleConditionsPointerEnd}
        >
          {/* Double-width track; translateX by -50% slides from the cards panel to the full conditions panel. md:translate-x-0 pins both panels in view side by side. */}
          <div
            className="overscroll-x-none flex h-full w-[200%] touch-pan-y translate-x-[var(--conditions-x)] md:w-full md:translate-x-0"
            style={
              {
                "--conditions-x": `-${conditionsProgress * 50}%`,
                transition: conditionsDragging
                  ? "none"
                  : "transform 300ms ease-out",
              } as React.CSSProperties
            }
          >
            {/* Left panel: draggable hero group cards, then the grid of individual metric cards */}
            <div className="no-scrollbar overscroll-x-none h-full w-1/2 shrink-0 overflow-y-auto touch-pan-y md:border-r md:border-hull-600/40">
              {/* Hero group cards: whole groups collapsed into one card, in user-defined order */}
              {matrixSettings.heroOrder.map((groupId) => {
                const group = DAILY_GROUPS.find((item) => item.id === groupId);
                if (!group || !matrixSettings.groups[group.id]) return null;

                return (
                  <MatrixGroupCard
                    key={group.id}
                    group={group}
                    visibleMetrics={matrixSettings.metrics}
                    day={day}
                    hour={hour}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/area", "heroOrder");
                      event.dataTransfer.setData("text/id", group.id);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) =>
                      handleDashboardDrop(event, group.id, "heroOrder")
                    }
                  />
                );
              })}

              {/* Individual metric cards: only shown when their parent group isn't collapsed */}
              <section
                className="mt-3 px-4"
                onDragOver={(event) => event.preventDefault()}
              >
                <div className="grid grid-cols-2 gap-3">
                  {matrixSettings.cardOrder.map((metricId) => {
                    const definition = allMetrics.find(
                      (metric) => metric.id === metricId,
                    );
                    const group = DAILY_GROUPS.find((item) =>
                      item.metrics.some((metric) => metric.id === metricId),
                    );

                    // Skip if the metric is disabled or its parent group card is already showing it
                    if (
                      !definition ||
                      !group ||
                      matrixSettings.groups[group.id] ||
                      matrixSettings.metrics[metricId] === false
                    ) {
                      return null;
                    }

                    return (
                      <MatrixMetricCard
                        key={metricId}
                        id={metricId}
                        label={definition.label}
                        day={day}
                        hour={hour}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/area", "cardOrder");
                          event.dataTransfer.setData("text/id", metricId);
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) =>
                          handleDashboardDrop(event, metricId, "cardOrder")
                        }
                      />
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right panel: detailed daily conditions view */}
            <div
              className={`no-scrollbar overscroll-x-none h-full w-1/2 shrink-0 overflow-y-auto touch-pan-y ${dockPosition === "bottom" ? "pb-44" : ""}`}
            >
              <FullConditionsView
                day={day}
                hour={hour}
                visibleMetrics={matrixSettings.metrics}
                onClose={() => setConditionsProgress(0)}
              />
            </div>
          </div>
        </div>

        {/* ================= BOTTOM DOCK (CONDITIONAL) ================= */}
        {/* Bottom dock: default control layout, docked to the bottom of the screen */}
        {dockPosition === "bottom" && (
          <DashboardDock position="bottom" {...dockProps} />
        )}

        {/* ================= MODALS & DRAWERS ================= */}
        {/* Full 24h drawer, revealed by dragging the dock handle or tapping into it */}
        <DayDrawer
          open={dayViewOpen}
          isDragging={drawerDragging}
          expansionProgress={drawerProgress}
          day={day}
          selectedHour={hour}
          hourlySettings={matrixSettings.hourly}
          dockPosition={dockPosition}
          onDragStart={handleDockDragStart}
          onDragMove={handleDockDragMove}
          onDragEnd={handleDockDragEnd}
          onClose={() => {
            setDayViewOpen(false);
            setDrawerProgress(0);
          }}
          onPickHour={onHourChange}
        />
        {/* Display-options bottom sheet: toggle card/metric visibility, layout, and dock position */}
        <CustomizationBottomSheet
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={cardSettings}
          onToggle={toggleCard}
          matrixSettings={matrixSettings}
          onToggleGroup={toggleGroup}
          onToggleMatrixMetric={toggleMatrixMetric}
          onReset={resetSettings}
          prototype={prototype}
          onSelectPrototype={onSelectPrototype}
          dockPosition={dockPosition}
          onSelectDockPosition={selectDockPosition}
        />
      </main>
    </div>
  );
}
