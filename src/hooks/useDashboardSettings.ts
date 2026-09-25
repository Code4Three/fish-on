import { useCallback, useEffect, useState } from "react";

export type DockPosition = "bottom" | "top";

const STORAGE_KEY = "fo_dashboard_settings";
const DEFAULT_DOCK_POSITION: DockPosition = "bottom";

function getStoredDockPosition(): DockPosition {
  if (typeof window === "undefined") {
    return DEFAULT_DOCK_POSITION;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "top" || stored === "bottom"
      ? stored
      : DEFAULT_DOCK_POSITION;
  } catch {
    return DEFAULT_DOCK_POSITION;
  }
}

export function useDashboardSettings() {
  const [dockPosition, setDockPosition] = useState<DockPosition>(
    getStoredDockPosition,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dockPosition }),
      );
    } catch {
      // Setting remains usable when browser storage is unavailable.
    }
  }, [dockPosition]);

  const selectDockPosition = useCallback((position: DockPosition) => {
    setDockPosition(position);
  }, []);

  return { dockPosition, selectDockPosition };
}
