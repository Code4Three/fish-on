import { useCallback, useEffect, useState } from "react";
import { DAILY_GROUPS, HOURLY_METRICS } from "../config/metricMatrix";

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

export type MetricVisibilitySettings = Record<string, boolean>;
export type GroupVisibilitySettings = Record<string, boolean>;

export interface MatrixSettings {
  groups: GroupVisibilitySettings;
  metrics: MetricVisibilitySettings;
  hourly: MetricVisibilitySettings;
  heroOrder: string[];
  cardOrder: string[];
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

const DEFAULT_MATRIX_SETTINGS: MatrixSettings = {
  groups: Object.fromEntries(DAILY_GROUPS.map(group => [group.id, true])),
  metrics: Object.fromEntries(DAILY_GROUPS.flatMap(group => group.metrics.map(metric => [metric.id, true]))),
  hourly: Object.fromEntries(HOURLY_METRICS.map(metric => [metric.id, true])),
  heroOrder: DAILY_GROUPS.map(group => group.id),
  cardOrder: DAILY_GROUPS.flatMap(group => group.metrics.map(metric => metric.id))
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

function getStoredMatrixSettings(): MatrixSettings {
  if (typeof window === "undefined") return DEFAULT_MATRIX_SETTINGS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as Partial<MatrixSettings> : {};
    const heroOrder = Array.isArray(parsed.heroOrder) ? parsed.heroOrder.filter(id => DEFAULT_MATRIX_SETTINGS.heroOrder.includes(id)) : [];
    const cardOrder = Array.isArray(parsed.cardOrder) ? parsed.cardOrder.filter(id => DEFAULT_MATRIX_SETTINGS.cardOrder.includes(id)) : [];
    return {
      groups: { ...DEFAULT_MATRIX_SETTINGS.groups, ...(parsed.groups ?? {}) },
      metrics: { ...DEFAULT_MATRIX_SETTINGS.metrics, ...(parsed.metrics ?? {}) },
      hourly: { ...DEFAULT_MATRIX_SETTINGS.hourly, ...(parsed.hourly ?? {}) },
      heroOrder: [...heroOrder, ...DEFAULT_MATRIX_SETTINGS.heroOrder.filter(id => !heroOrder.includes(id))],
      cardOrder: [...cardOrder, ...DEFAULT_MATRIX_SETTINGS.cardOrder.filter(id => !cardOrder.includes(id))]
    };
  } catch {
    return DEFAULT_MATRIX_SETTINGS;
  }
}

export function useAnchoredSettings() {
  const [settings, setSettings] = useState<AnchoredSettingsState>(getStoredSettings);
  const [cardSettings, setCardSettings] = useState<DashboardCardSettings>(getStoredCardSettings);
  const [matrixSettings, setMatrixSettings] = useState<MatrixSettings>(getStoredMatrixSettings);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, ...cardSettings, ...matrixSettings }));
    } catch {
      // Settings remain usable when browser storage is unavailable.
    }
  }, [settings, cardSettings, matrixSettings]);

  const toggleMetric = useCallback((metric: AnchoredMetric) => {
    setSettings(current => ({
      ...current,
      [metric]: !current[metric]
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    setCardSettings({ ...DEFAULT_CARD_SETTINGS });
    setMatrixSettings({
      groups: { ...DEFAULT_MATRIX_SETTINGS.groups },
      metrics: { ...DEFAULT_MATRIX_SETTINGS.metrics },
      hourly: { ...DEFAULT_MATRIX_SETTINGS.hourly },
      heroOrder: [...DEFAULT_MATRIX_SETTINGS.heroOrder],
      cardOrder: [...DEFAULT_MATRIX_SETTINGS.cardOrder]
    });
  }, []);

  const toggleCard = useCallback((card: keyof DashboardCardSettings) => {
    setCardSettings(current => ({ ...current, [card]: !current[card] }));
  }, []);

  const toggleGroup = useCallback((group: string) => {
    setMatrixSettings(current => ({ ...current, groups: { ...current.groups, [group]: !current.groups[group] } }));
  }, []);

  const toggleMatrixMetric = useCallback((metric: string, hourly = false) => {
    setMatrixSettings(current => ({ ...current, [hourly ? "hourly" : "metrics"]: { ...current[hourly ? "hourly" : "metrics"], [metric]: !current[hourly ? "hourly" : "metrics"][metric] } }));
  }, []);

  const moveDashboardItem = useCallback((item: string, target: string, area: "heroOrder" | "cardOrder") => {
    setMatrixSettings(current => {
      const order = [...current[area]];
      const from = order.indexOf(item);
      const to = order.indexOf(target);
      if (from < 0 || to < 0 || from === to) return current;
      order.splice(from, 1);
      order.splice(from < to ? to - 1 : to, 0, item);
      return { ...current, [area]: order };
    });
  }, []);

  return { settings, cardSettings, matrixSettings, toggleMetric, toggleCard, toggleGroup, toggleMatrixMetric, moveDashboardItem, resetSettings };
}
