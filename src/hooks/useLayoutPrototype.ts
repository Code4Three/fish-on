import { useCallback, useEffect, useState } from "react";

export type PrototypeId = 0 | 1 | 4;

export interface PrototypeOption {
  id: PrototypeId;
  label: string;
  description: string;
}

export const PROTOTYPE_OPTIONS: PrototypeOption[] = [
  { id: 4, label: "Main Dashboard", description: "Production default (bottom dock layout)" },
  { id: 0, label: "Prototype 0 - Original", description: "Original stacked layout" },
  { id: 1, label: "Prototype 1 - Bottom Dock", description: "Thumb-first fixed controls" }
];

const STORAGE_KEY = "fo_layout_prototype";
const DEFAULT_PROTOTYPE: PrototypeId = 4;

function getStoredPrototype(): PrototypeId {
  if (typeof window === "undefined") {
    return DEFAULT_PROTOTYPE;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored === null ? NaN : Number(stored);
    return PROTOTYPE_OPTIONS.some(option => option.id === parsed)
      ? (parsed as PrototypeId)
      : DEFAULT_PROTOTYPE;
  } catch {
    return DEFAULT_PROTOTYPE;
  }
}

export function useLayoutPrototype() {
  const [prototype, setPrototype] = useState<PrototypeId>(getStoredPrototype);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, String(prototype));
    } catch {
      // Selection remains usable when browser storage is unavailable.
    }
  }, [prototype]);

  const selectPrototype = useCallback((id: PrototypeId) => {
    setPrototype(id);
  }, []);

  return { prototype, selectPrototype };
}
