import { useMemo, useState } from "react";
import { buildDayData } from "../../data/conditions";
import { useConditions } from "../../hooks/useConditions";
import { useLayoutPrototype } from "../../hooks/useLayoutPrototype";
import MainDashboard from "../MainDashboard";
import { DEFAULT_HOUR } from "./shared";
import Option0Current from "./Option0Current";
import Option1BottomDock from "./Option1BottomDock";

// Owns the date/hour and prototype selection so they survive switching between prototypes.
export default function PrototypeSwitcher() {
  const { prototype, selectPrototype } = useLayoutPrototype();
  const { days, loading, error } = useConditions();
  const [offset, setOffset] = useState(0);
  const [hour, setHour] = useState(DEFAULT_HOUR);

  const maxOffset = Math.max(0, days.length - 1);
  const clampedOffset = Math.min(Math.max(offset, 0), maxOffset);
  const day = useMemo(() => (days.length ? buildDayData(days, clampedOffset) : null), [days, clampedOffset]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-hull-950 px-6 text-center font-body text-[14px] text-slate-300">
        Loading conditions…
      </main>
    );
  }

  if (error || !day) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-hull-950 px-6 text-center font-body text-[14px] text-slate-300">
        {error ?? "No conditions data is available right now."}
      </main>
    );
  }

  const dashboardProps = {
    day,
    hour,
    offset: clampedOffset,
    onHourChange: setHour,
    onOffsetChange: (nextOffset: number) => setOffset(Math.min(Math.max(nextOffset, 0), maxOffset)),
    prototype,
    onSelectPrototype: selectPrototype
  };

  if (prototype === 0) return <Option0Current {...dashboardProps} />;
  if (prototype === 1) return <Option1BottomDock {...dashboardProps} />;
  return <MainDashboard {...dashboardProps} />;
}
