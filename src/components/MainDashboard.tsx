import { useRef, useState } from "react";
import { Fish, Settings, Waves } from "lucide-react";
import { DAILY_GROUPS } from "../config/metricMatrix";
import { useAnchoredSettings } from "../hooks/useAnchoredSettings";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import CustomizationBottomSheet from "./settings/CustomizationBottomSheet";
import {
  DashboardStateProps,
  DayDrawer,
  FullConditionsView,
  HourPills,
  MatrixGroupCard,
  MatrixMetricCard,
  StepButton,
  formatDate,
  ratingTier
} from "./prototypes/shared";

function DashboardDock({
  position,
  offset,
  hour,
  day,
  onOffsetChange,
  onHourChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  expansionProgress,
  isDragging
}: {
  position: "bottom" | "top";
  offset: number;
  hour: number;
  day: DashboardStateProps["day"];
  onOffsetChange: (offset: number) => void;
  onHourChange: (hour: number) => void;
  onDragStart: (startY: number) => void;
  onDragMove: (currentY: number) => void;
  onDragEnd: () => void;
  expansionProgress: number;
  isDragging: boolean;
}) {
  const isBottom = position === "bottom";
  const dockTravel = typeof window === "undefined" ? 0 : Math.max(0, window.innerHeight - 72 - 132);
  const isExpanded = expansionProgress > 0;

  return (
    <div
      className={`${isBottom ? "fixed bottom-0 left-0 right-0 z-40" : isExpanded ? "fixed left-0 right-0 z-40" : "sticky top-[72px] z-40"} mx-auto max-w-md select-none bg-hull-950/75 px-4 pb-4 pt-3 backdrop-blur ${isDragging ? "" : "transition-[bottom,top,transform] duration-300 ease-out"}`}
      style={isBottom ? { bottom: `${expansionProgress * dockTravel}px` } : isExpanded ? { top: "72px" } : undefined}
    >
      <div
        className={`absolute inset-x-1 z-10 flex h-12 cursor-grab touch-none items-center justify-center active:cursor-grabbing ${isBottom ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"}`}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onDragStart(event.clientY);
        }}
        onPointerMove={event => onDragMove(event.clientY)}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        aria-label={`${isBottom ? "Bottom" : "Top"} dashboard dock. Swipe ${isBottom ? "up" : "down"} for the full day forecast.`}
      >
        <div className="h-1 w-10 rounded-full bg-hull-600/90" />
      </div>
      <div className="flex items-center justify-between gap-1">
        <StepButton label="Prev Day" direction="left" onClick={() => onOffsetChange(offset - 1)} />
        <span className="min-h-12 flex-1 truncate bg-transparent px-2 text-center font-body text-[13px] font-semibold leading-[48px] text-white">
          {formatDate(offset)}
        </span>
        <StepButton label="Next Day" direction="right" onClick={() => onOffsetChange(offset + 1)} />
      </div>
      <div className="mt-2">
        <HourPills hour={hour} day={day} onHourChange={onHourChange} />
      </div>
    </div>
  );
}

// Production dashboard: bottom-dock thumb-first layout (formerly Prototype 1). Settings live in the header only.
export default function MainDashboard({ day, hour, offset, onHourChange, onOffsetChange, prototype, onSelectPrototype }: DashboardStateProps) {
  const { cardSettings, matrixSettings, toggleCard, toggleGroup, toggleMatrixMetric, moveDashboardItem, resetSettings } = useAnchoredSettings();
  const { dockPosition, selectDockPosition } = useDashboardSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);
  const [drawerProgress, setDrawerProgress] = useState(0);
  const [drawerDragging, setDrawerDragging] = useState(false);
  const [conditionsProgress, setConditionsProgress] = useState(0);
  const [conditionsDragging, setConditionsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragStartProgress = useRef(0);
  const conditionsStartX = useRef<number | null>(null);
  const conditionsStartY = useRef<number | null>(null);
  const conditionsStartProgress = useRef(0);

  const current = day.hours[hour];
  const rising = day.hours[Math.min(23, hour + 1)].tideHeight > current.tideHeight;
  const handleDockDragStart = (startY: number) => {
    dragStartY.current = startY;
    dragStartProgress.current = drawerProgress;
    setDrawerDragging(true);
  };

  const handleDockDragMove = (currentY: number) => {
    if (dragStartY.current === null) return;
    const deltaY = currentY - dragStartY.current;
    const travel = Math.max(1, window.innerHeight - 72 - 132);
    const progressDelta = dockPosition === "bottom" ? -deltaY / travel : deltaY / travel;
    setDrawerProgress(Math.max(0, Math.min(1, dragStartProgress.current + progressDelta)));
  };

  const handleDockDragEnd = () => {
    if (dragStartY.current === null) return;
    const shouldOpen = drawerProgress >= 0.5;
    setDrawerProgress(shouldOpen ? 1 : 0);
    setDayViewOpen(shouldOpen);
    setDrawerDragging(false);
    dragStartY.current = null;
  };

  const handleConditionsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.pointerType === "touch") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    conditionsStartX.current = event.clientX;
    conditionsStartY.current = event.clientY;
    conditionsStartProgress.current = conditionsProgress;
  };

  const handleConditionsPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (conditionsStartX.current === null || conditionsStartY.current === null) return;
    const deltaX = event.clientX - conditionsStartX.current;
    const deltaY = event.clientY - conditionsStartY.current;

    if (!conditionsDragging) {
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
    setConditionsProgress(Math.max(0, Math.min(1, conditionsStartProgress.current + progressDelta)));
  };

  const handleConditionsPointerEnd = () => {
    if (conditionsStartX.current === null) return;
    setConditionsProgress(current => current >= 0.5 ? 1 : 0);
    setConditionsDragging(false);
    conditionsStartX.current = null;
    conditionsStartY.current = null;
  };

  const handleDashboardDrop = (event: React.DragEvent<HTMLElement>, target: string, area: "heroOrder" | "cardOrder") => {
    event.preventDefault();
    const sourceArea = event.dataTransfer.getData("text/area");
    const source = event.dataTransfer.getData("text/id");
    if (sourceArea === area) moveDashboardItem(source, target, area);
  };

  return (
    <main className="dashboard-shell overscroll-x-none relative mx-auto flex h-[100dvh] min-h-[100svh] max-w-md flex-col overflow-hidden bg-hull-950 font-body touch-pan-y">
      <header className="sticky top-0 z-20 shrink-0 bg-hull-950/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tide-500/15 text-tide-400">
              <Fish size={16} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[16px] font-semibold text-white">Mooloolaba River Mouth</h1>
              <p className="flex items-center gap-1.5 truncate font-body text-[12px] text-slate-400">
                <Waves size={12} className="shrink-0 text-tide-400" />
                {current.tideHeight.toFixed(1)}m {rising ? "rising" : "falling"} · {ratingTier(day.solunarRating)} solunar
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

      {dockPosition === "top" && (
        <DashboardDock
          position="top"
          offset={offset}
          hour={hour}
          day={day}
          onOffsetChange={onOffsetChange}
          onHourChange={onHourChange}
          onDragStart={handleDockDragStart}
          onDragMove={handleDockDragMove}
          onDragEnd={handleDockDragEnd}
          expansionProgress={drawerProgress}
          isDragging={drawerDragging}
        />
      )}

      <div
        className={`overscroll-x-none min-h-0 flex-1 overflow-hidden ${conditionsDragging ? "touch-none" : "touch-pan-y"}`}
        onPointerDown={handleConditionsPointerDown}
        onPointerMove={handleConditionsPointerMove}
        onPointerUp={handleConditionsPointerEnd}
        onPointerCancel={handleConditionsPointerEnd}
        onLostPointerCapture={handleConditionsPointerEnd}
      >
        <div
          className="overscroll-x-none flex h-full w-[200%] touch-pan-y"
          style={{
            transform: `translateX(-${conditionsProgress * 50}%)`,
            transition: conditionsDragging ? "none" : "transform 300ms ease-out"
          }}
        >
          <div className={`no-scrollbar overscroll-x-none h-full w-1/2 shrink-0 overflow-y-auto touch-pan-y ${dockPosition === "bottom" ? "pb-44" : ""}`}>
            {matrixSettings.heroOrder.map(groupId => {
              const group = DAILY_GROUPS.find(item => item.id === groupId);
              if (!group || !matrixSettings.groups[group.id]) return null;
              return <MatrixGroupCard key={group.id} group={group} visibleMetrics={matrixSettings.metrics} day={day} hour={hour} draggable onDragStart={event => { event.dataTransfer.setData("text/area", "heroOrder"); event.dataTransfer.setData("text/id", group.id); }} onDragOver={event => event.preventDefault()} onDrop={event => handleDashboardDrop(event, group.id, "heroOrder")} />;
            })}
            <section className="mt-3 px-4" onDragOver={event => event.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                {matrixSettings.cardOrder.map(metricId => {
                  const definition = DAILY_GROUPS.flatMap(group => group.metrics).find(metric => metric.id === metricId);
                  const group = DAILY_GROUPS.find(item => item.metrics.some(metric => metric.id === metricId));
                  if (!definition || !group || matrixSettings.groups[group.id] || matrixSettings.metrics[metricId] === false) return null;
                  return <MatrixMetricCard key={metricId} id={metricId} label={definition.label} day={day} hour={hour} draggable onDragStart={event => { event.dataTransfer.setData("text/area", "cardOrder"); event.dataTransfer.setData("text/id", metricId); }} onDragOver={event => event.preventDefault()} onDrop={event => handleDashboardDrop(event, metricId, "cardOrder")} />;
                })}
              </div>
            </section>
          </div>
          <div className="no-scrollbar overscroll-x-none h-full w-1/2 shrink-0 overflow-y-auto touch-pan-y">
            <FullConditionsView day={day} hour={hour} visibleMetrics={matrixSettings.metrics} onClose={() => setConditionsProgress(0)} />
          </div>
        </div>
      </div>

      {dockPosition === "bottom" && (
        <DashboardDock
          position="bottom"
          offset={offset}
          hour={hour}
          day={day}
          onOffsetChange={onOffsetChange}
          onHourChange={onHourChange}
          onDragStart={handleDockDragStart}
          onDragMove={handleDockDragMove}
          onDragEnd={handleDockDragEnd}
          expansionProgress={drawerProgress}
          isDragging={drawerDragging}
        />
      )}

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
  );
}
