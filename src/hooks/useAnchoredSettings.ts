import { useCallback, useEffect, useState } from "react";

export interface AnchoredSettingsState {
  wind: boolean;
  pressure: boolean;
  waterTemp: boolean;
  swell: boolean;
  moonPhase: boolean;
  rain: boolean;
  uv: boolean;
  airTemp: boolean;
}

type AnchoredMetric = keyof AnchoredSettingsState;

const STORAGE_KEY = "fo_anchored_settings";

const DEFAULT_SETTINGS: AnchoredSettingsState = {
  wind: true,
  pressure: true,
  waterTemp: true,
  swell: true,
  moonPhase: true,
  rain: true,
  uv: true,
  airTemp: true
};

function getStoredSettings(): AnchoredSettingsState {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_SETTINGS;
    }

    const candidate = parsed as Partial<Record<AnchoredMetric, unknown>>;
    return Object.keys(DEFAULT_SETTINGS).reduce((settings, metric) => {
      const key = metric as AnchoredMetric;
      settings[key] = typeof candidate[key] === "boolean"
        ? candidate[key]
        : DEFAULT_SETTINGS[key];
      return settings;
    }, {} as AnchoredSettingsState);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useAnchoredSettings() {
  const [settings, setSettings] = useState<AnchoredSettingsState>(getStoredSettings);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Settings remain usable when browser storage is unavailable.
    }
  }, [settings]);

  const toggleMetric = useCallback((metric: AnchoredMetric) => {
    setSettings(current => ({
      ...current,
      [metric]: !current[metric]
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return { settings, toggleMetric, resetSettings };
}
