import { useCallback, useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DAILY_GROUPS,
  HOURLY_GRID_METRICS,
  HOURLY_SECTIONS,
} from "../config/metricMatrix";

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
  conditionsOrder: string[];
  hourlySectionOrder: string[];
  hourlyColumnOrder: Record<string, string[]>;
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
  airTemp: true,
};

const DEFAULT_CARD_SETTINGS: DashboardCardSettings = {
  temperature: true,
  weather: true,
  moon: true,
  sun: true,
  swell: true,
};

const DEFAULT_DASHBOARD_GROUP_ORDER = [
  "fishability",
  "tide",
  "solunar",
  "water",
  "weather",
  "sunMoon",
] as const;

const DEFAULT_MATRIX_SETTINGS: MatrixSettings = {
  groups: Object.fromEntries(DAILY_GROUPS.map((group) => [group.id, true])),
  metrics: Object.fromEntries(
    DAILY_GROUPS.flatMap((group) =>
      group.metrics.map((metric) => [metric.id, true]),
    ),
  ),
  hourly: Object.fromEntries(
    HOURLY_GRID_METRICS.map((metric) => [metric.id, metric.defaultVisible]),
  ),
  heroOrder: [...DEFAULT_DASHBOARD_GROUP_ORDER],
  cardOrder: DEFAULT_DASHBOARD_GROUP_ORDER.flatMap((groupId) =>
    DAILY_GROUPS.find((group) => group.id === groupId)?.metrics.map((metric) => metric.id) ?? [],
  ),
  conditionsOrder: ["dailySummary", "tide", "solunar", "water", "weather"],
  hourlySectionOrder: HOURLY_SECTIONS.map((section) => section.id),
  hourlyColumnOrder: Object.fromEntries(
    HOURLY_SECTIONS.map((section) => [section.id, [...section.metricIds]]),
  ),
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
      settings[key] =
        typeof candidate[key] === "boolean"
          ? candidate[key]
          : DEFAULT_SETTINGS[key];
      return settings;
    }, {} as AnchoredSettingsState);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Card-level settings predate the metric matrix; this reads a matrix-era blob and derives
// the old card flags from it so users upgrading don't lose their previous choices.
function getStoredCardSettings(): DashboardCardSettings {
  if (typeof window === "undefined") return DEFAULT_CARD_SETTINGS;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored
      ? (JSON.parse(stored) as Partial<
        AnchoredSettingsState & DashboardCardSettings
      >)
      : {};
    // Fall back to the legacy per-metric flags (waterTemp/airTemp/wind/etc.) when the new card flag is absent
    return {
      temperature:
        typeof parsed.temperature === "boolean"
          ? parsed.temperature
          : Boolean(parsed.waterTemp || parsed.airTemp || stored === null),
      weather:
        typeof parsed.weather === "boolean"
          ? parsed.weather
          : Boolean(parsed.wind || parsed.rain || parsed.uv || stored === null),
      moon:
        typeof parsed.moon === "boolean"
          ? parsed.moon
          : Boolean(parsed.moonPhase || stored === null),
      sun:
        typeof parsed.sun === "boolean"
          ? parsed.sun
          : DEFAULT_CARD_SETTINGS.sun,
      swell:
        typeof parsed.swell === "boolean"
          ? parsed.swell
          : Boolean(parsed.swell || stored === null),
    };
  } catch {
    return DEFAULT_CARD_SETTINGS;
  }
}

function getStoredMatrixSettings(): MatrixSettings {
  if (typeof window === "undefined") return DEFAULT_MATRIX_SETTINGS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored
      ? (JSON.parse(stored) as Partial<MatrixSettings>)
      : {};
    // Drop any stale ids no longer in the default order, then append newly-added ids at the end
    const heroOrder = Array.isArray(parsed.heroOrder)
      ? parsed.heroOrder.filter((id) =>
        DEFAULT_MATRIX_SETTINGS.heroOrder.includes(id),
      )
      : [];
    const cardOrder = Array.isArray(parsed.cardOrder)
      ? parsed.cardOrder.filter((id) =>
        DEFAULT_MATRIX_SETTINGS.cardOrder.includes(id),
      )
      : [];
    const conditionsOrder = Array.isArray(parsed.conditionsOrder)
      ? parsed.conditionsOrder.filter((id) =>
        DEFAULT_MATRIX_SETTINGS.conditionsOrder.includes(id),
      )
      : [];
    const hourlySectionOrder = Array.isArray(parsed.hourlySectionOrder)
      ? parsed.hourlySectionOrder.filter((id) =>
        DEFAULT_MATRIX_SETTINGS.hourlySectionOrder.includes(id),
      )
      : [];
    const storedHourlyColumnOrder =
      parsed.hourlyColumnOrder && typeof parsed.hourlyColumnOrder === "object"
        ? parsed.hourlyColumnOrder
        : {};
    const hourlyColumnOrder = Object.fromEntries(
      HOURLY_SECTIONS.map((section) => {
        const storedOrder = Array.isArray(storedHourlyColumnOrder[section.id])
          ? storedHourlyColumnOrder[section.id].filter((id) =>
            section.metricIds.includes(id),
          )
          : [];
        return [
          section.id,
          [
            ...storedOrder,
            ...section.metricIds.filter((id) => !storedOrder.includes(id)),
          ],
        ];
      }),
    );
    return {
      groups: { ...DEFAULT_MATRIX_SETTINGS.groups, ...(parsed.groups ?? {}) },
      metrics: {
        ...DEFAULT_MATRIX_SETTINGS.metrics,
        ...(parsed.metrics ?? {}),
      },
      hourly: { ...DEFAULT_MATRIX_SETTINGS.hourly, ...(parsed.hourly ?? {}) },
      heroOrder: [
        ...heroOrder,
        ...DEFAULT_MATRIX_SETTINGS.heroOrder.filter(
          (id) => !heroOrder.includes(id),
        ),
      ],
      cardOrder: [
        ...cardOrder,
        ...DEFAULT_MATRIX_SETTINGS.cardOrder.filter(
          (id) => !cardOrder.includes(id),
        ),
      ],
      conditionsOrder: [
        ...conditionsOrder,
        ...DEFAULT_MATRIX_SETTINGS.conditionsOrder.filter(
          (id) => !conditionsOrder.includes(id),
        ),
      ],
      hourlySectionOrder: [
        ...hourlySectionOrder,
        ...DEFAULT_MATRIX_SETTINGS.hourlySectionOrder.filter(
          (id) => !hourlySectionOrder.includes(id),
        ),
      ],
      hourlyColumnOrder,
    };
  } catch {
    return DEFAULT_MATRIX_SETTINGS;
  }
}

export function useAnchoredSettings() {
  const [settings, setSettings] =
    useState<AnchoredSettingsState>(getStoredSettings);
  const [cardSettings, setCardSettings] = useState<DashboardCardSettings>(
    getStoredCardSettings,
  );
  const [matrixSettings, setMatrixSettings] = useState<MatrixSettings>(
    getStoredMatrixSettings,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...settings, ...cardSettings, ...matrixSettings }),
      );
    } catch {
      // Settings remain usable when browser storage is unavailable.
    }
  }, [settings, cardSettings, matrixSettings]);

  const toggleMetric = useCallback((metric: AnchoredMetric) => {
    setSettings((current) => ({
      ...current,
      [metric]: !current[metric],
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
      cardOrder: [...DEFAULT_MATRIX_SETTINGS.cardOrder],
      conditionsOrder: [...DEFAULT_MATRIX_SETTINGS.conditionsOrder],
      hourlySectionOrder: [...DEFAULT_MATRIX_SETTINGS.hourlySectionOrder],
      hourlyColumnOrder: Object.fromEntries(
        Object.entries(DEFAULT_MATRIX_SETTINGS.hourlyColumnOrder).map(
          ([section, order]) => [section, [...order]],
        ),
      ),
    });
  }, []);

  const toggleCard = useCallback((card: keyof DashboardCardSettings) => {
    setCardSettings((current) => ({ ...current, [card]: !current[card] }));
  }, []);

  const toggleGroup = useCallback((group: string) => {
    setMatrixSettings((current) => ({
      ...current,
      groups: { ...current.groups, [group]: !current.groups[group] },
    }));
  }, []);

  const toggleMatrixMetric = useCallback((metric: string, hourly = false) => {
    setMatrixSettings((current) => ({
      ...current,
      [hourly ? "hourly" : "metrics"]: {
        ...current[hourly ? "hourly" : "metrics"],
        [metric]: !current[hourly ? "hourly" : "metrics"][metric],
      },
    }));
  }, []);

  const moveDashboardItem = useCallback(
    (item: string, target: string, area: "heroOrder" | "cardOrder") => {
      setMatrixSettings((current) => {
        const order = current[area];
        const from = order.indexOf(item);
        const to = order.indexOf(target);
        if (from < 0 || to < 0 || from === to) return current;
        return { ...current, [area]: arrayMove(order, from, to) };
      });
    },
    [],
  );

  const moveConditionsItem = useCallback((item: string, target: string) => {
    setMatrixSettings((current) => {
      const order = current.conditionsOrder;
      const from = order.indexOf(item);
      const to = order.indexOf(target);
      if (from < 0 || to < 0 || from === to) return current;
      return { ...current, conditionsOrder: arrayMove(order, from, to) };
    });
  }, []);

  const moveHourlySection = useCallback((item: string, target: string) => {
    setMatrixSettings((current) => {
      const order = current.hourlySectionOrder;
      const from = order.indexOf(item);
      const to = order.indexOf(target);
      if (from < 0 || to < 0 || from === to) return current;
      return { ...current, hourlySectionOrder: arrayMove(order, from, to) };
    });
  }, []);

  const moveHourlyColumn = useCallback(
    (sectionId: string, item: string, target: string) => {
      setMatrixSettings((current) => {
        const order = current.hourlyColumnOrder[sectionId];
        if (!order) return current;
        const from = order.indexOf(item);
        const to = order.indexOf(target);
        if (from < 0 || to < 0 || from === to) return current;
        return {
          ...current,
          hourlyColumnOrder: {
            ...current.hourlyColumnOrder,
            [sectionId]: arrayMove(order, from, to),
          },
        };
      });
    },
    [],
  );

  return {
    settings,
    cardSettings,
    matrixSettings,
    toggleMetric,
    toggleCard,
    toggleGroup,
    toggleMatrixMetric,
    moveDashboardItem,
    moveConditionsItem,
    moveHourlySection,
    moveHourlyColumn,
    resetSettings,
  };
}
