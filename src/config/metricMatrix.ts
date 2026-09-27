export type MetricDisplayMode = "hero" | "card";

export interface DailyMetricDefinition {
  id: string;
  label: string;
  displayNotes: string;
  canDisplayAlone: boolean;
}

export interface DailyGroupDefinition {
  id: string;
  label: string;
  metrics: DailyMetricDefinition[];
}

// Source of truth for the dashboard's customizable metric groups/cards (order, labels, visibility defaults)
export const DAILY_GROUPS: DailyGroupDefinition[] = [
  {
    id: "fishability",
    label: "Fishability rating",
    metrics: [
      {
        id: "hourlyScore",
        label: "Hourly/current score",
        displayNotes: "Displayed with score and band",
        canDisplayAlone: true,
      },
      {
        id: "maxDayScore",
        label: "Max day score",
        displayNotes: "Calculated from the best hourly score",
        canDisplayAlone: true,
      },
      {
        id: "feedingWindows",
        label: "Peak feeding score windows",
        displayNotes: "Next strong window",
        canDisplayAlone: false,
      },
    ],
  },
  {
    id: "tide",
    label: "Tide",
    metrics: [
      {
        id: "currentTide",
        label: "Current tide height/stage",
        displayNotes: "Current height and stage",
        canDisplayAlone: false,
      },
      {
        id: "nextTide",
        label: "Next high/low tide",
        displayNotes: "Next tide event",
        canDisplayAlone: false,
      },
    ],
  },
  {
    id: "water",
    label: "Water",
    metrics: [
      {
        id: "waterTemperature",
        label: "Water temperature/range",
        displayNotes: "Placeholder when unavailable",
        canDisplayAlone: true,
      },
      {
        id: "swell",
        label: "Swell height/period/direction/range",
        displayNotes: "Placeholder when unavailable",
        canDisplayAlone: true,
      },
    ],
  },
  {
    id: "solunar",
    label: "Solunar",
    metrics: [
      {
        id: "solunarFeedingWindows",
        label: "Major/minor feeding windows",
        displayNotes: "Shown in Full Conditions",
        canDisplayAlone: false,
      },
      {
        id: "solunarStatus",
        label: "Current solunar status/trend",
        displayNotes: "Neutral, Building, Peak, or Fading",
        canDisplayAlone: false,
      },
    ],
  },
  {
    id: "sunMoon",
    label: "Sun and moon",
    metrics: [
      {
        id: "moon",
        label: "Moon phase/illumination/moonrise/moonset",
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "sunrise",
        label: "Sunrise/sunset",
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "firstLight",
        label: "First light/last light",
        displayNotes: "Placeholder when unavailable",
        canDisplayAlone: false,
      },
    ],
  },
  {
    id: "weather",
    label: "Weather and atmospheric",
    metrics: [
      {
        id: "pressure",
        label: "Barometric pressure",
        displayNotes: "Daily trend",
        canDisplayAlone: true,
      },
      {
        id: "airTemperature",
        label: "Air temperature/range",
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "feelsLike",
        label: "Feels-like temperature",
        displayNotes: "Minor to air temperature",
        canDisplayAlone: false,
      },
      {
        id: "wind",
        label: "Wind speed/direction",
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "gust",
        label: "Gust speed",
        displayNotes: "Minor to wind",
        canDisplayAlone: false,
      },
      {
        id: "cloud",
        label: "Cloud baseline",
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "rainChance",
        label: "Rain chance",
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "rainVolume",
        label: "Rain volume",
        displayNotes: "Minor to rain chance",
        canDisplayAlone: false,
      },
      {
        id: "uv",
        label: "UV Index",
        displayNotes: "Placeholder when unavailable",
        canDisplayAlone: true,
      },
    ],
  },
];

export const HOURLY_METRICS = [
  { id: "hourlyScore", label: "Hourly score and descriptive band" },
  { id: "tide", label: "Tide height/stage/direction" },
  { id: "waterTemp", label: "Water temp" },
  { id: "swell", label: "Hourly swell" },
  { id: "solunarActive", label: "Hourly solunar active state" },
  { id: "solunarStatus", label: "Current solunar status/trend" },
  { id: "solunarRating", label: "Numeric hourly solunar rating" },
  { id: "pressure", label: "Pressure" },
  { id: "airTemperature", label: "Air temperature" },
  { id: "feelsLike", label: "Feels like temperature" },
  { id: "wind", label: "Wind speed/direction" },
  { id: "gust", label: "Gust speed" },
  { id: "cloud", label: "Cloud cover" },
  { id: "rainChance", label: "Rain chance" },
  { id: "rainVolume", label: "Rain volume" },
  { id: "uv", label: "UV index" },
] as const;

export interface EnvironmentalMetricKeys {
  baseline?: string;
  range?: string;
  maximum?: string;
  direction?: string;
}

export interface EnvironmentalMetricDefinition {
  id: string;
  key: string;
  label: string;
  unit: string;
  icon: string;
  group: "weather" | "water";
  groupLabel: string;
  fullConditionsSection: string;
  dailyFullConditionsSection?: string;
  dailyKeys?: EnvironmentalMetricKeys;
  hourlySettingId?: string;
  hourlyColumnAvailable?: boolean;
  hourlyColumnToggleable?: boolean;
  defaultVisibility: {
    summaryCards: boolean;
    fullConditions: boolean;
    hourlyGrid: boolean;
  };
  precision?: number;
}

const DEFAULT_ENVIRONMENTAL_VISIBILITY = {
  summaryCards: true,
  fullConditions: true,
  hourlyGrid: true,
};

// Additional conditions payload fields; keys correspond directly to conditions.json.
export const ENVIRONMENTAL_METRICS: EnvironmentalMetricDefinition[] = [
  {
    id: "pressure",
    key: "pressure",
    label: "Surface pressure",
    unit: "hPa",
    icon: "Gauge",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "pressureBaseline", range: "pressureRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "humidity",
    key: "humidity",
    label: "Relative humidity",
    unit: "%",
    icon: "Droplets",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "humidityBaseline", range: "humidityRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "dewPoint",
    key: "dewPoint",
    label: "Dew point",
    unit: "°C",
    icon: "Thermometer",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "dewPointBaseline", range: "dewPointRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "cloud",
    key: "cloudCover",
    label: "Total cloud cover",
    unit: "%",
    icon: "Cloud",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "cloudBaseline" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudCoverLow",
    key: "cloudCoverLow",
    label: "Low cloud cover",
    unit: "%",
    icon: "Cloud",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "cloudCoverLowBaseline" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudCoverMid",
    key: "cloudCoverMid",
    label: "Mid-level cloud cover",
    unit: "%",
    icon: "Cloud",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "cloudCoverMidBaseline" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudCoverHigh",
    key: "cloudCoverHigh",
    label: "High cloud cover",
    unit: "%",
    icon: "Cloud",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { baseline: "cloudCoverHighBaseline" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudBase",
    key: "cloudBase",
    label: "Cloud base",
    unit: "m",
    icon: "Cloud",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { range: "cloudBaseRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "visibility",
    key: "visibility",
    label: "Visibility",
    unit: "m",
    icon: "Eye",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
    dailyKeys: { range: "visibilityRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "waterTemperature",
    key: "seaSurfaceTemperature",
    label: "Sea surface temperature",
    unit: "°C",
    icon: "Thermometer",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: {
      baseline: "seaSurfaceTemperatureBaseline",
      range: "seaSurfaceTemperatureRange",
    },
    hourlySettingId: "waterTemp",
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "waveHeight",
    key: "waveHeight",
    label: "Wave height",
    unit: "m",
    icon: "Waves",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { range: "waveHeightRange", maximum: "waveHeightMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "waveDirection",
    key: "waveDirection",
    label: "Wave direction",
    unit: "",
    icon: "Compass",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { direction: "waveDirectionDominant" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "wavePeriod",
    key: "wavePeriod",
    label: "Wave period",
    unit: "s",
    icon: "Waves",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { range: "wavePeriodRange", maximum: "wavePeriodMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "windWaveHeight",
    key: "windWaveHeight",
    label: "Wind wave height",
    unit: "m",
    icon: "Waves",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: {
      range: "windWaveHeightRange",
      maximum: "windWaveHeightMax",
    },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "windWaveDirection",
    key: "windWaveDirection",
    label: "Wind wave direction",
    unit: "",
    icon: "Compass",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { direction: "windWaveDirectionDominant" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "windWavePeriod",
    key: "windWavePeriod",
    label: "Wind wave period",
    unit: "s",
    icon: "Waves",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { range: "windWavePeriodRange", maximum: "windWavePeriodMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "swell",
    key: "swellWaveHeight",
    label: "Swell height",
    unit: "m",
    icon: "Waves",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: {
      range: "swellWaveHeightRange",
      maximum: "swellWaveHeightMax",
    },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "swellWaveDirection",
    key: "swellWaveDirection",
    label: "Swell direction",
    unit: "",
    icon: "Compass",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { direction: "swellWaveDirectionDominant" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "swellWavePeriod",
    key: "swellWavePeriod",
    label: "Swell period",
    unit: "s",
    icon: "Waves",
    group: "water",
    groupLabel: "Water & marine conditions",
    fullConditionsSection: "Current water & marine",
    dailyKeys: { range: "swellWavePeriodRange", maximum: "swellWavePeriodMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
];

const EXISTING_HOURLY_METRIC_IDS = new Set<string>(
  HOURLY_METRICS.map((metric) => metric.id),
);

export const HOURLY_GRID_METRICS = [
  ...HOURLY_METRICS.map((metric) => ({
    ...metric,
    availableColumn: true,
    toggleable: true,
    defaultVisible: true,
  })),
  ...ENVIRONMENTAL_METRICS.filter(
    (metric) =>
      metric.hourlyColumnAvailable ?? metric.defaultVisibility.hourlyGrid,
  )
    .filter(
      (metric) =>
        !EXISTING_HOURLY_METRIC_IDS.has(metric.hourlySettingId ?? metric.id),
    )
    .map((metric) => ({
      id: metric.hourlySettingId ?? metric.id,
      label: metric.label,
      availableColumn:
        metric.hourlyColumnAvailable ?? metric.defaultVisibility.hourlyGrid,
      toggleable: metric.hourlyColumnToggleable ?? true,
      defaultVisible: metric.defaultVisibility.hourlyGrid,
    })),
];

export type DailyGroupId = (typeof DAILY_GROUPS)[number]["id"];
export type DailyMetricId =
  (typeof DAILY_GROUPS)[number]["metrics"][number]["id"];
export type HourlyMetricId = (typeof HOURLY_GRID_METRICS)[number]["id"];
