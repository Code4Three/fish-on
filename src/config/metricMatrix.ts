export type MetricDisplayMode = "hero" | "card";
export type UnitSystem = "metric" | "imperial";
export type MetricConversion =
  | "temperature"
  | "speed"
  | "metersToFeet"
  | "kilometersToMiles"
  | "millimetersToInches"
  | "pressure"
  | "moonDistance1000s"
  | "none";

export interface MetricDisplayDefinition {
  label: string;
  metricUnit: string;
  imperialUnit: string;
  conversion: MetricConversion;
  metricPrecision: number;
  imperialPrecision: number;
}

export const METRIC_DISPLAY_DEFINITIONS = {
  hourlyScore: { label: "Fishing score", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  maxDayScore: { label: "Maximum day score", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  feedingWindows: { label: "Peak feeding windows", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  currentTide: { label: "Tide height", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 1, imperialPrecision: 1 },
  tideStage: { label: "Tide stage", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  nextTide: { label: "Next high/low tide", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  datumOffset: { label: "Tide datum offset", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 2, imperialPrecision: 2 },
  waterTemperature: { label: "Water temperature", metricUnit: "°C", imperialUnit: "°F", conversion: "temperature", metricPrecision: 1, imperialPrecision: 1 },
  solunarFeedingWindows: { label: "Solunar feeding windows", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  solunarStatus: { label: "Solunar status", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  moon: { label: "Moon", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  sunrise: { label: "Sunrise / sunset", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  firstLight: { label: "First / last light", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  pressure: { label: "Barometric pressure", metricUnit: "hPa", imperialUnit: "inHg", conversion: "pressure", metricPrecision: 0, imperialPrecision: 2 },
  humidity: { label: "Relative humidity", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  dewPoint: { label: "Dew point", metricUnit: "°C", imperialUnit: "°F", conversion: "temperature", metricPrecision: 1, imperialPrecision: 1 },
  airTemperature: { label: "Air temperature", metricUnit: "°C", imperialUnit: "°F", conversion: "temperature", metricPrecision: 1, imperialPrecision: 1 },
  feelsLike: { label: "Feels-like temperature", metricUnit: "°C", imperialUnit: "°F", conversion: "temperature", metricPrecision: 1, imperialPrecision: 1 },
  wind: { label: "Wind speed", metricUnit: "km/h", imperialUnit: "mph", conversion: "speed", metricPrecision: 1, imperialPrecision: 1 },
  windDirection: { label: "Wind direction", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  gust: { label: "Gust speed", metricUnit: "km/h", imperialUnit: "mph", conversion: "speed", metricPrecision: 1, imperialPrecision: 1 },
  cloud: { label: "Cloud cover", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  rainChance: { label: "Rain chance", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  rainVolume: { label: "Rain volume", metricUnit: "mm", imperialUnit: "in", conversion: "millimetersToInches", metricPrecision: 1, imperialPrecision: 2 },
  rain: { label: "Rain", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  uv: { label: "UV index", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 1, imperialPrecision: 1 },
  airTemp: { label: "Air temperature", metricUnit: "°C", imperialUnit: "°F", conversion: "temperature", metricPrecision: 1, imperialPrecision: 1 },
  moonPhase: { label: "Moon phase", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  moonIllumination: { label: "Moon illumination", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  moonOverhead: { label: "Moon over / under", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  moonrise: { label: "Moon rise / set", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  moonDistance: { label: "Moon distance", metricUnit: "km", imperialUnit: "mi", conversion: "moonDistance1000s", metricPrecision: 0, imperialPrecision: 0 },
  solunarCondition: { label: "Current solunar condition", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  weatherCondition: { label: "Weather condition", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  weatherSummary: { label: "Weather summary", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  tideRating: { label: "Tide score", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  scoreBand: { label: "Score band", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  dayScore: { label: "Day score", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  barometricState: { label: "Barometric state", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  pressureTrend: { label: "Pressure trend", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  windDirectionShift: { label: "Wind direction shift", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  waveDirectionShift: { label: "Wave direction shift", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  windWaveDirectionShift: { label: "Wind wave direction shift", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  swellWaveDirectionShift: { label: "Swell direction shift", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  tide: { label: "Tide height", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 1, imperialPrecision: 1 },
  tideDirection: { label: "Tide direction", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  waterTemp: { label: "Water temperature", metricUnit: "°C", imperialUnit: "°F", conversion: "temperature", metricPrecision: 1, imperialPrecision: 1 },
  swell: { label: "Swell height", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 1, imperialPrecision: 1 },
  solunarActive: { label: "Solunar activity", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  solunarRating: { label: "Solunar score", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  cloudCoverLow: { label: "Low cloud cover", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  cloudCoverMid: { label: "Mid-level cloud cover", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  cloudCoverHigh: { label: "High cloud cover", metricUnit: "%", imperialUnit: "%", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  cloudBase: { label: "Cloud base", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 0, imperialPrecision: 0 },
  visibility: { label: "Visibility", metricUnit: "km", imperialUnit: "mi", conversion: "kilometersToMiles", metricPrecision: 2, imperialPrecision: 2 },
  waveHeight: { label: "Wave height", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 1, imperialPrecision: 1 },
  waveDirection: { label: "Wave direction", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  wavePeriod: { label: "Wave period", metricUnit: "s", imperialUnit: "s", conversion: "none", metricPrecision: 1, imperialPrecision: 1 },
  windWaveHeight: { label: "Wind wave height", metricUnit: "m", imperialUnit: "ft", conversion: "metersToFeet", metricPrecision: 1, imperialPrecision: 1 },
  windWaveDirection: { label: "Wind wave direction", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  windWavePeriod: { label: "Wind wave period", metricUnit: "s", imperialUnit: "s", conversion: "none", metricPrecision: 1, imperialPrecision: 1 },
  swellWaveDirection: { label: "Swell direction", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  swellWavePeriod: { label: "Swell period", metricUnit: "s", imperialUnit: "s", conversion: "none", metricPrecision: 1, imperialPrecision: 1 },
} as const satisfies Record<string, MetricDisplayDefinition>;

export type MetricGroupId = "fishability" | "sunMoon" | "water" | "weather";

export interface MetricSourceDefinition {
  anchored?: string;
  hourly?: string;
  secondary?: string;
  runtime?: string;
  dailyBaseline?: string;
  dailyRange?: string;
  dailyMaximum?: string;
  dailyDirection?: string;
}

export interface MetricDefaultOrder {
  dashboardGroup: number | null;
  dashboardMetric: number | null;
  hourlySection: number | null;
  hourlyMetric: number | null;
  fullConditions: number | null;
}

export interface CatalogMetricDefinition {
  id: string;
  label: string;
  group: MetricGroupId;
  source: MetricSourceDefinition;
  defaultOrder: MetricDefaultOrder | null;
}

// Metrics available in the generated/runtime data but intentionally not assigned to a UI surface yet.
// Keeping these definitions here prevents later views from inventing labels, groups, or source names.
export const CATALOG_ONLY_METRICS: CatalogMetricDefinition[] = [
  {
    id: "weatherCondition",
    label: getMetricLabel("weatherCondition"),
    group: "weather",
    source: { hourly: "weatherCondition" },
    defaultOrder: null,
  },
  {
    id: "weatherSummary",
    label: getMetricLabel("weatherSummary"),
    group: "weather",
    source: { anchored: "weatherSummary" },
    defaultOrder: null,
  },
  {
    id: "tideStage",
    label: getMetricLabel("tideStage"),
    group: "water",
    source: { hourly: "tideStage" },
    defaultOrder: null,
  },
  {
    id: "tideDirection",
    label: getMetricLabel("tideDirection"),
    group: "water",
    source: { runtime: "tideDirection" },
    defaultOrder: null,
  },
  {
    id: "solunarCondition",
    label: getMetricLabel("solunarCondition"),
    group: "sunMoon",
    source: { hourly: "solunarCondition" },
    defaultOrder: null,
  },
  {
    id: "tideRating",
    label: getMetricLabel("tideRating"),
    group: "fishability",
    source: { runtime: "tideRating" },
    defaultOrder: null,
  },
  {
    id: "scoreBand",
    label: getMetricLabel("scoreBand"),
    group: "fishability",
    source: { runtime: "scoreBand" },
    defaultOrder: null,
  },
  {
    id: "dayScore",
    label: getMetricLabel("dayScore"),
    group: "fishability",
    source: { anchored: "dayScore" },
    defaultOrder: null,
  },
  {
    id: "barometricState",
    label: getMetricLabel("barometricState"),
    group: "weather",
    source: { runtime: "barometric.state" },
    defaultOrder: null,
  },
  {
    id: "pressureTrend",
    label: getMetricLabel("pressureTrend"),
    group: "weather",
    source: { hourly: "pressureTrend", secondary: "pressure.trend" },
    defaultOrder: null,
  },
  {
    id: "windDirectionShift",
    label: getMetricLabel("windDirectionShift"),
    group: "weather",
    source: { secondary: "windDirectionShift" },
    defaultOrder: null,
  },
  {
    id: "waveDirectionShift",
    label: getMetricLabel("waveDirectionShift"),
    group: "water",
    source: { secondary: "waveDirectionShift" },
    defaultOrder: null,
  },
  {
    id: "windWaveDirectionShift",
    label: getMetricLabel("windWaveDirectionShift"),
    group: "water",
    source: { secondary: "windWaveDirectionShift" },
    defaultOrder: null,
  },
  {
    id: "swellWaveDirectionShift",
    label: getMetricLabel("swellWaveDirectionShift"),
    group: "water",
    source: { secondary: "swellWaveDirectionShift" },
    defaultOrder: null,
  },
];

export function getMetricDisplayDefinition(metricId: string) {
  return METRIC_DISPLAY_DEFINITIONS[
    metricId as keyof typeof METRIC_DISPLAY_DEFINITIONS
  ] ?? null;
}

function getMetricLabel(metricId: keyof typeof METRIC_DISPLAY_DEFINITIONS) {
  return METRIC_DISPLAY_DEFINITIONS[metricId].label;
}

// Fishability favorable window configuration: hours on either side of Peak/Strong/Favorable score peaks.
// Note: 1.5-hour margin applied to integer hour indices produces half-hour boundaries.
// Example: Hour 3 with ±1.5 hours → [1.5, 4.5] displays as "1:30 AM - 4:30 AM".
// This is mathematically correct and provides a consistent visual pattern for time ranges.
export const FISHABILITY_FAVORABLE_WINDOW_MARGIN = 1.5;

export interface DailyMetricDefinition {
  id: string;
  label: string;
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
    label: "Fishability",
    metrics: [
      {
        id: "hourlyScore",
        label: getMetricLabel("hourlyScore"),
      },
      {
        id: "maxDayScore",
        label: getMetricLabel("maxDayScore"),
      },
      {
        id: "feedingWindows",
        label: getMetricLabel("feedingWindows"),
      },
    ],
  },
  {
    id: "sunMoon",
    label: "Sun and moon",
    metrics: [
      {
        id: "solunarFeedingWindows",
        label: getMetricLabel("solunarFeedingWindows"),
      },
      {
        id: "solunarStatus",
        label: getMetricLabel("solunarStatus"),
      },
      {
        id: "moonOverhead",
        label: getMetricLabel("moonOverhead"),
      },
      {
        id: "moonrise",
        label: getMetricLabel("moonrise"),
      },
      {
        id: "moon",
        label: getMetricLabel("moon"),
      },
      {
        id: "moonDistance",
        label: getMetricLabel("moonDistance"),
      },
      {
        id: "sunrise",
        label: getMetricLabel("sunrise"),
      },
      {
        id: "firstLight",
        label: getMetricLabel("firstLight"),
      },
    ],
  },
  {
    id: "water",
    label: "Water",
    metrics: [
      {
        id: "currentTide",
        label: getMetricLabel("currentTide"),
      },
      {
        id: "nextTide",
        label: getMetricLabel("nextTide"),
      },
      {
        id: "waterTemperature",
        label: getMetricLabel("waterTemperature"),
      },
      {
        id: "swell",
        label: getMetricLabel("swell"),
      },
    ],
  },
  {
    id: "weather",
    label: "Weather and atmospheric",
    metrics: [
      {
        id: "pressure",
        label: getMetricLabel("pressure"),
      },
      {
        id: "airTemperature",
        label: getMetricLabel("airTemperature"),
      },
      {
        id: "feelsLike",
        label: getMetricLabel("feelsLike"),
      },
      {
        id: "wind",
        label: getMetricLabel("wind"),
      },
      {
        id: "windDirection",
        label: getMetricLabel("windDirection"),
      },
      {
        id: "gust",
        label: getMetricLabel("gust"),
      },
      {
        id: "cloud",
        label: getMetricLabel("cloud"),
      },
      {
        id: "rainChance",
        label: getMetricLabel("rainChance"),
      },
      {
        id: "rainVolume",
        label: getMetricLabel("rainVolume"),
      },
      {
        id: "uv",
        label: getMetricLabel("uv"),
      },
    ],
  },
];

export const DEFAULT_DASHBOARD_GROUP_ORDER = [
  "fishability",
  "sunMoon",
  "water",
  "weather",
];

export const DEFAULT_FULL_CONDITIONS_ORDER = [
  "dailySummary",
  "fishability",
  "sunMoon",
  "water",
  "weather",
];

export const HOURLY_METRICS = [
  { id: "hourlyScore", label: getMetricLabel("hourlyScore") },
  { id: "tide", label: getMetricLabel("tide") },
  { id: "waterTemp", label: getMetricLabel("waterTemp") },
  { id: "swell", label: getMetricLabel("swell") },
  { id: "solunarActive", label: getMetricLabel("solunarActive") },
  { id: "solunarStatus", label: getMetricLabel("solunarStatus") },
  { id: "solunarRating", label: getMetricLabel("solunarRating") },
  { id: "pressure", label: getMetricLabel("pressure") },
  { id: "airTemperature", label: getMetricLabel("airTemperature") },
  { id: "feelsLike", label: getMetricLabel("feelsLike") },
  { id: "wind", label: getMetricLabel("wind") },
  { id: "gust", label: getMetricLabel("gust") },
  { id: "cloud", label: getMetricLabel("cloud") },
  { id: "rainChance", label: getMetricLabel("rainChance") },
  { id: "rainVolume", label: getMetricLabel("rainVolume") },
  { id: "uv", label: getMetricLabel("uv") },
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
  metricUnit: string;
  imperialUnit: string;
  conversion: MetricConversion;
  icon: string;
  group: "weather" | "water";
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
    label: getMetricLabel("pressure"),
    unit: METRIC_DISPLAY_DEFINITIONS.pressure.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.pressure,
    icon: "Gauge",
    group: "weather",
    dailyKeys: { baseline: "pressureBaseline", range: "pressureRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "humidity",
    key: "humidity",
    label: getMetricLabel("humidity"),
    unit: METRIC_DISPLAY_DEFINITIONS.humidity.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.humidity,
    icon: "Droplets",
    group: "weather",
    dailyKeys: { baseline: "humidityBaseline", range: "humidityRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "dewPoint",
    key: "dewPoint",
    label: getMetricLabel("dewPoint"),
    unit: METRIC_DISPLAY_DEFINITIONS.dewPoint.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.dewPoint,
    icon: "Thermometer",
    group: "weather",
    dailyKeys: { baseline: "dewPointBaseline", range: "dewPointRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "cloud",
    key: "cloudCover",
    label: getMetricLabel("cloud"),
    unit: METRIC_DISPLAY_DEFINITIONS.cloud.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.cloud,
    icon: "Cloud",
    group: "weather",
    dailyKeys: { baseline: "cloudBaseline", range: "cloudRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudCoverLow",
    key: "cloudCoverLow",
    label: getMetricLabel("cloudCoverLow"),
    unit: METRIC_DISPLAY_DEFINITIONS.cloudCoverLow.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.cloudCoverLow,
    icon: "Cloud",
    group: "weather",
    dailyKeys: {
      baseline: "cloudCoverLowBaseline",
      range: "cloudCoverLowRange",
    },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudCoverMid",
    key: "cloudCoverMid",
    label: getMetricLabel("cloudCoverMid"),
    unit: METRIC_DISPLAY_DEFINITIONS.cloudCoverMid.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.cloudCoverMid,
    icon: "Cloud",
    group: "weather",
    dailyKeys: {
      baseline: "cloudCoverMidBaseline",
      range: "cloudCoverMidRange",
    },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudCoverHigh",
    key: "cloudCoverHigh",
    label: getMetricLabel("cloudCoverHigh"),
    unit: METRIC_DISPLAY_DEFINITIONS.cloudCoverHigh.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.cloudCoverHigh,
    icon: "Cloud",
    group: "weather",
    dailyKeys: {
      baseline: "cloudCoverHighBaseline",
      range: "cloudCoverHighRange",
    },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "cloudBase",
    key: "cloudBase",
    label: getMetricLabel("cloudBase"),
    unit: METRIC_DISPLAY_DEFINITIONS.cloudBase.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.cloudBase,
    icon: "Cloud",
    group: "weather",
    dailyKeys: { range: "cloudBaseRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "visibility",
    key: "visibility",
    label: getMetricLabel("visibility"),
    unit: METRIC_DISPLAY_DEFINITIONS.visibility.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.visibility,
    icon: "Eye",
    group: "weather",
    dailyKeys: { range: "visibilityRange" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 2,
  },
  {
    id: "waterTemperature",
    key: "seaSurfaceTemperature",
    label: getMetricLabel("waterTemperature"),
    unit: METRIC_DISPLAY_DEFINITIONS.waterTemperature.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.waterTemperature,
    icon: "Thermometer",
    group: "water",
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
    label: getMetricLabel("waveHeight"),
    unit: METRIC_DISPLAY_DEFINITIONS.waveHeight.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.waveHeight,
    icon: "Waves",
    group: "water",
    dailyKeys: { range: "waveHeightRange", maximum: "waveHeightMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "waveDirection",
    key: "waveDirection",
    label: getMetricLabel("waveDirection"),
    unit: METRIC_DISPLAY_DEFINITIONS.waveDirection.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.waveDirection,
    icon: "Compass",
    group: "water",
    dailyKeys: { direction: "waveDirectionDominant" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "wavePeriod",
    key: "wavePeriod",
    label: getMetricLabel("wavePeriod"),
    unit: METRIC_DISPLAY_DEFINITIONS.wavePeriod.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.wavePeriod,
    icon: "Waves",
    group: "water",
    dailyKeys: { range: "wavePeriodRange", maximum: "wavePeriodMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "windWaveHeight",
    key: "windWaveHeight",
    label: getMetricLabel("windWaveHeight"),
    unit: METRIC_DISPLAY_DEFINITIONS.windWaveHeight.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.windWaveHeight,
    icon: "Waves",
    group: "water",
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
    label: getMetricLabel("windWaveDirection"),
    unit: METRIC_DISPLAY_DEFINITIONS.windWaveDirection.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.windWaveDirection,
    icon: "Compass",
    group: "water",
    dailyKeys: { direction: "windWaveDirectionDominant" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "windWavePeriod",
    key: "windWavePeriod",
    label: getMetricLabel("windWavePeriod"),
    unit: METRIC_DISPLAY_DEFINITIONS.windWavePeriod.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.windWavePeriod,
    icon: "Waves",
    group: "water",
    dailyKeys: { range: "windWavePeriodRange", maximum: "windWavePeriodMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
  {
    id: "swell",
    key: "swellWaveHeight",
    label: getMetricLabel("swell"),
    unit: METRIC_DISPLAY_DEFINITIONS.swell.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.swell,
    icon: "Waves",
    group: "water",
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
    label: getMetricLabel("swellWaveDirection"),
    unit: METRIC_DISPLAY_DEFINITIONS.swellWaveDirection.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.swellWaveDirection,
    icon: "Compass",
    group: "water",
    dailyKeys: { direction: "swellWaveDirectionDominant" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
  },
  {
    id: "swellWavePeriod",
    key: "swellWavePeriod",
    label: getMetricLabel("swellWavePeriod"),
    unit: METRIC_DISPLAY_DEFINITIONS.swellWavePeriod.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.swellWavePeriod,
    icon: "Waves",
    group: "water",
    dailyKeys: { range: "swellWavePeriodRange", maximum: "swellWavePeriodMax" },
    defaultVisibility: DEFAULT_ENVIRONMENTAL_VISIBILITY,
    precision: 1,
  },
];

export interface HourlySectionDefinition {
  id: string;
  label: string;
  metricIds: string[];
}

export const HOURLY_SECTIONS: HourlySectionDefinition[] = [
  {
    id: "fishability",
    label: "Fishability",
    metricIds: [
      "hourlyScore",
      "scoreBand",
      "tideRating",
      "maxDayScore",
      "feedingWindows",
      "dayScore",
    ],
  },
  {
    id: "sunMoon",
    label: "Sun and moon",
    metricIds: [
      "solunarActive",
      "solunarStatus",
      "solunarCondition",
      "solunarRating",
      "solunarFeedingWindows",
      "moon",
      "moonPhase",
      "moonIllumination",
      "moonOverhead",
      "moonrise",
      "moonDistance",
      "sunrise",
      "firstLight",
    ],
  },
  {
    id: "water",
    label: "Water",
    metricIds: [
      "tide",
      "tideStage",
      "tideDirection",
      "nextTide",
      "waveDirectionShift",
      "windWaveDirectionShift",
      "swellWaveDirectionShift",
      "waterTemperature",
      "waveHeight",
      "waveDirection",
      "wavePeriod",
      "windWaveHeight",
      "windWaveDirection",
      "windWavePeriod",
      "swell",
      "swellWaveDirection",
      "swellWavePeriod",
    ],
  },
  {
    id: "weather",
    label: "Weather and atmospheric",
    metricIds: [
      "weatherCondition",
      "weatherSummary",
      "wind",
      "windDirection",
      "windDirectionShift",
      "gust",
      "pressure",
      "pressureTrend",
      "barometricState",
      "airTemperature",
      "feelsLike",
      "cloud",
      "rainChance",
      "rainVolume",
      "uv",
      "humidity",
      "dewPoint",
      "cloudCoverLow",
      "cloudCoverMid",
      "cloudCoverHigh",
      "cloudBase",
      "visibility",
    ],
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

const CATALOG_ONLY_METRICS_BY_ID = new Map(
  CATALOG_ONLY_METRICS.map((metric) => [metric.id, metric]),
);
const METRIC_GROUP_OVERRIDES: Record<string, MetricGroupId> = {
  datumOffset: "water",
  airTemp: "weather",
  moonPhase: "sunMoon",
  moonIllumination: "sunMoon",
  rain: "weather",
  waterTemp: "water",
};
const METRIC_SOURCE_OVERRIDES: Record<string, MetricSourceDefinition> = {
  hourlyScore: { hourly: "score", runtime: "scoreBand" },
  maxDayScore: { runtime: "max(hours[].score)" },
  feedingWindows: { runtime: "scoreBand windows" },
  currentTide: { hourly: "tideHeight", runtime: "tideStage" },
  nextTide: { runtime: "tideEvents" },
  solunarFeedingWindows: { runtime: "majorWindows/minorWindows" },
  solunarStatus: { runtime: "solunarStatusTrend" },
  moonOverhead: { secondary: "moon.moonOverhead/moonUnderfoot" },
  moonrise: { secondary: "moon.moonrise/moonset" },
  moon: { secondary: "moon.phaseName/moon.illum" },
  moonDistance: { secondary: "moon.moonDistance" },
  sunrise: { anchored: "sunrise/sunset" },
  firstLight: { anchored: "firstLight/lastLight" },
  airTemperature: { hourly: "airTemp", runtime: "ranges.airTemp" },
  feelsLike: { hourly: "feelsLike", runtime: "ranges.feelsLike" },
  wind: { hourly: "wind.speed", runtime: "ranges.wind" },
  windDirection: { hourly: "wind.dir", secondary: "windDirectionShift" },
  gust: { hourly: "wind.gust", runtime: "ranges.gust" },
  rainChance: { hourly: "rainChance", anchored: "rainChance" },
  rainVolume: { hourly: "rainVolume", anchored: "rainVolume" },
  uv: { hourly: "uvIndex", secondary: "uv" },
  airTemp: { hourly: "airTemp" },
  moonPhase: { secondary: "moon.phaseName" },
  moonIllumination: { secondary: "moon.illum" },
  tide: { hourly: "tideHeight" },
  waterTemp: { hourly: "seaSurfaceTemperature" },
  swell: {
    hourly: "swellWaveHeight",
    runtime: "swellWavePeriod/swellWaveDirection",
  },
  solunarActive: { hourly: "solunar" },
  solunarRating: { hourly: "solunarRating", runtime: "day.solunarRating" },
  rain: { hourly: "rainChance/rainVolume" },
};

const metricGroupById = new Map<string, MetricGroupId>();
const dashboardOrderById = new Map<string, [number, number]>();
DAILY_GROUPS.forEach((group, groupIndex) => {
  group.metrics.forEach((metric, metricIndex) => {
    metricGroupById.set(metric.id, group.id as MetricGroupId);
    dashboardOrderById.set(metric.id, [groupIndex, metricIndex]);
  });
});
ENVIRONMENTAL_METRICS.forEach((metric) => {
  metricGroupById.set(metric.id, metric.group);
});
const hourlyOrderById = new Map<string, [number, number]>();
HOURLY_SECTIONS.forEach((section, sectionIndex) => {
  section.metricIds.forEach((metricId, metricIndex) => {
    metricGroupById.set(metricId, section.id as MetricGroupId);
    hourlyOrderById.set(metricId, [sectionIndex, metricIndex]);
  });
});

export const METRIC_CATALOG: CatalogMetricDefinition[] = Object.entries(
  METRIC_DISPLAY_DEFINITIONS,
).map(([id, displayDefinition]) => {
  const catalogOnlyMetric = CATALOG_ONLY_METRICS_BY_ID.get(id);
  const group =
    metricGroupById.get(id) ??
    catalogOnlyMetric?.group ??
    METRIC_GROUP_OVERRIDES[id];
  if (!group) {
    throw new Error(`Metric ${id} is missing a canonical group`);
  }

  const environmentalMetric = ENVIRONMENTAL_METRICS.find(
    (metric) => metric.id === id,
  );
  const dashboardOrder = dashboardOrderById.get(id);
  const hourlyOrder = hourlyOrderById.get(id);

  return {
    id,
    label: displayDefinition.label,
    group,
    source: catalogOnlyMetric?.source ??
      (environmentalMetric
        ? {
          hourly: environmentalMetric.key,
          dailyBaseline: environmentalMetric.dailyKeys?.baseline,
          dailyRange: environmentalMetric.dailyKeys?.range,
          dailyMaximum: environmentalMetric.dailyKeys?.maximum,
          dailyDirection: environmentalMetric.dailyKeys?.direction,
        }
        : METRIC_SOURCE_OVERRIDES[id] ?? { runtime: id }),
    defaultOrder: {
      dashboardGroup: dashboardOrder?.[0] ?? null,
      dashboardMetric: dashboardOrder?.[1] ?? null,
      hourlySection: hourlyOrder?.[0] ?? null,
      hourlyMetric: hourlyOrder?.[1] ?? null,
      fullConditions: null,
    },
  };
});

export type DailyGroupId = (typeof DAILY_GROUPS)[number]["id"];
export type DailyMetricId =
  (typeof DAILY_GROUPS)[number]["metrics"][number]["id"];
export type HourlyMetricId = (typeof HOURLY_GRID_METRICS)[number]["id"];
