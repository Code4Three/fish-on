import { useCallback, useEffect, useState } from "react";

export interface AnchoredSettingsState {
  wind: boolean;
  waterTemp: boolean;
  swell: boolean;
  moonPhase: boolean;
  rain: boolean;
  uv: boolean;
  airTemp: boolean;
}

export interface DashboardCardSettings {
  temperature: boolean;
  weather: boolean;
  moon: boolean;
  sun: boolean;
  swell: boolean;
}

type AnchoredMetric = keyof AnchoredSettingsState;

const STORAGE_KEY = "fo_anchored_settings";

const DEFAULT_SETTINGS: AnchoredSettingsState = {
  wind: true,
  waterTemp: true,
  swell: true,
  moonPhase: true,
  rain: true,
  uv: true,
  airTemp: true
};

const DEFAULT_CARD_SETTINGS: DashboardCardSettings = {
  temperature: true,
  weather: true,
  moon: true,
  sun: true,
  swell: true
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

function getStoredCardSettings(): DashboardCardSettings {
  if (typeof window === "undefined") return DEFAULT_CARD_SETTINGS;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as Partial<AnchoredSettingsState & DashboardCardSettings> : {};
    return {
      temperature: typeof parsed.temperature === "boolean" ? parsed.temperature : Boolean(parsed.waterTemp || parsed.airTemp || stored === null),
      weather: typeof parsed.weather === "boolean" ? parsed.weather : Boolean(parsed.wind || parsed.rain || parsed.uv || stored === null),
      moon: typeof parsed.moon === "boolean" ? parsed.moon : Boolean(parsed.moonPhase || stored === null),
      sun: typeof parsed.sun === "boolean" ? parsed.sun : DEFAULT_CARD_SETTINGS.sun,
      swell: typeof parsed.swell === "boolean" ? parsed.swell : Boolean(parsed.swell || stored === null)
    };
  } catch {
    return DEFAULT_CARD_SETTINGS;
  }
}

export function useAnchoredSettings() {
  const [settings, setSettings] = useState<AnchoredSettingsState>(getStoredSettings);
  const [cardSettings, setCardSettings] = useState<DashboardCardSettings>(getStoredCardSettings);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, ...cardSettings }));
    } catch {
      // Settings remain usable when browser storage is unavailable.
    }
  }, [settings, cardSettings]);

  const toggleMetric = useCallback((metric: AnchoredMetric) => {
    setSettings(current => ({
      ...current,
      [metric]: !current[metric]
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    setCardSettings({ ...DEFAULT_CARD_SETTINGS });
  }, []);

  const toggleCard = useCallback((card: keyof DashboardCardSettings) => {
    setCardSettings(current => ({ ...current, [card]: !current[card] }));
  }, []);

  return { settings, cardSettings, toggleMetric, toggleCard, resetSettings };
}
