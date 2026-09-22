import { useMemo, useState } from "react";
import { generateClaudeDayData } from "../../data/mockMarineData";
import { useLayoutPrototype } from "../../hooks/useLayoutPrototype";
import { DEFAULT_HOUR } from "./shared";
import Option0Current from "./Option0Current";
import Option1BottomDock from "./Option1BottomDock";
import Option2StickyHUD from "./Option2StickyHUD";
import Option3ZeroScrollHUD from "./Option3ZeroScrollHUD";

// Owns the date/hour and prototype selection so they survive switching between prototypes.
export default function PrototypeSwitcher() {
  const { prototype, selectPrototype } = useLayoutPrototype();
  const [offset, setOffset] = useState(0);
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const day = useMemo(() => generateClaudeDayData(offset), [offset]);

  const dashboardProps = {
    day,
    hour,
    offset,
    onHourChange: setHour,
    onOffsetChange: setOffset,
    prototype,
    onSelectPrototype: selectPrototype
  };

  if (prototype === 1) return <Option1BottomDock {...dashboardProps} />;
  if (prototype === 2) return <Option2StickyHUD {...dashboardProps} />;
  if (prototype === 3) return <Option3ZeroScrollHUD {...dashboardProps} />;
  return <Option0Current {...dashboardProps} />;
}
