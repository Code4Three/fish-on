export type MetricDisplayMode = "hero" | "card";
export type UnitSystem = "metric" | "imperial";
export type MetricConversion =
  | "temperature"
  | "speed"
  | "metersToFeet"
  | "kilometersToMiles"
  | "millimetersToInches"
  | "pressure"
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
  moonrise: { label: "Moonrise / moonset", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
  solunarCondition: { label: "Current solunar condition", metricUnit: "", imperialUnit: "", conversion: "none", metricPrecision: 0, imperialPrecision: 0 },
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

export function getMetricDisplayDefinition(metricId: string) {
  return METRIC_DISPLAY_DEFINITIONS[
    metricId as keyof typeof METRIC_DISPLAY_DEFINITIONS
  ] ?? null;
}

function getMetricLabel(metricId: keyof typeof METRIC_DISPLAY_DEFINITIONS) {
  return METRIC_DISPLAY_DEFINITIONS[metricId].label;
}

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
        label: getMetricLabel("hourlyScore"),
        displayNotes: "Displayed with score and band",
        canDisplayAlone: true,
      },
      {
        id: "maxDayScore",
        label: getMetricLabel("maxDayScore"),
        displayNotes: "Calculated from the best hourly score",
        canDisplayAlone: true,
      },
      {
        id: "feedingWindows",
        label: getMetricLabel("feedingWindows"),
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
        label: getMetricLabel("currentTide"),
        displayNotes: "Current height and stage",
        canDisplayAlone: false,
      },
      {
        id: "nextTide",
        label: getMetricLabel("nextTide"),
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
        label: getMetricLabel("waterTemperature"),
        displayNotes: "Placeholder when unavailable",
        canDisplayAlone: true,
      },
      {
        id: "swell",
        label: getMetricLabel("swell"),
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
        label: getMetricLabel("solunarFeedingWindows"),
        displayNotes: "Shown in Full Conditions",
        canDisplayAlone: false,
      },
      {
        id: "solunarStatus",
        label: getMetricLabel("solunarStatus"),
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
        label: getMetricLabel("moon"),
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "sunrise",
        label: getMetricLabel("sunrise"),
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "firstLight",
        label: getMetricLabel("firstLight"),
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
        label: getMetricLabel("pressure"),
        displayNotes: "Daily trend",
        canDisplayAlone: true,
      },
      {
        id: "airTemperature",
        label: getMetricLabel("airTemperature"),
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "feelsLike",
        label: getMetricLabel("feelsLike"),
        displayNotes: "Minor to air temperature",
        canDisplayAlone: false,
      },
      {
        id: "wind",
        label: getMetricLabel("wind"),
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "windDirection",
        label: getMetricLabel("windDirection"),
        displayNotes: "Current direction",
        canDisplayAlone: true,
      },
      {
        id: "gust",
        label: getMetricLabel("gust"),
        displayNotes: "Minor to wind",
        canDisplayAlone: false,
      },
      {
        id: "cloud",
        label: getMetricLabel("cloud"),
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "rainChance",
        label: getMetricLabel("rainChance"),
        displayNotes: "Displayed",
        canDisplayAlone: true,
      },
      {
        id: "rainVolume",
        label: getMetricLabel("rainVolume"),
        displayNotes: "Minor to rain chance",
        canDisplayAlone: false,
      },
      {
        id: "uv",
        label: getMetricLabel("uv"),
        displayNotes: "Placeholder when unavailable",
        canDisplayAlone: true,
      },
    ],
  },
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
    label: getMetricLabel("pressure"),
    unit: METRIC_DISPLAY_DEFINITIONS.pressure.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.pressure,
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
    label: getMetricLabel("humidity"),
    unit: METRIC_DISPLAY_DEFINITIONS.humidity.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.humidity,
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
    label: getMetricLabel("dewPoint"),
    unit: METRIC_DISPLAY_DEFINITIONS.dewPoint.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.dewPoint,
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
    label: getMetricLabel("cloud"),
    unit: METRIC_DISPLAY_DEFINITIONS.cloud.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.cloud,
    icon: "Cloud",
    group: "weather",
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
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
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
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
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
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
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
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
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
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
    groupLabel: "Weather & atmospheric conditions",
    fullConditionsSection: "Current weather & atmospheric",
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
    label: getMetricLabel("waveHeight"),
    unit: METRIC_DISPLAY_DEFINITIONS.waveHeight.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.waveHeight,
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
    label: getMetricLabel("waveDirection"),
    unit: METRIC_DISPLAY_DEFINITIONS.waveDirection.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.waveDirection,
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
    label: getMetricLabel("wavePeriod"),
    unit: METRIC_DISPLAY_DEFINITIONS.wavePeriod.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.wavePeriod,
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
    label: getMetricLabel("windWaveHeight"),
    unit: METRIC_DISPLAY_DEFINITIONS.windWaveHeight.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.windWaveHeight,
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
    label: getMetricLabel("windWaveDirection"),
    unit: METRIC_DISPLAY_DEFINITIONS.windWaveDirection.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.windWaveDirection,
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
    label: getMetricLabel("windWavePeriod"),
    unit: METRIC_DISPLAY_DEFINITIONS.windWavePeriod.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.windWavePeriod,
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
    label: getMetricLabel("swell"),
    unit: METRIC_DISPLAY_DEFINITIONS.swell.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.swell,
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
    label: getMetricLabel("swellWaveDirection"),
    unit: METRIC_DISPLAY_DEFINITIONS.swellWaveDirection.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.swellWaveDirection,
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
    label: getMetricLabel("swellWavePeriod"),
    unit: METRIC_DISPLAY_DEFINITIONS.swellWavePeriod.metricUnit,
    ...METRIC_DISPLAY_DEFINITIONS.swellWavePeriod,
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
