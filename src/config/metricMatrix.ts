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

export const DAILY_GROUPS: DailyGroupDefinition[] = [
  {
    id: "fishability",
    label: "Fishability rating",
    metrics: [
      { id: "hourlyScore", label: "Hourly/current score", displayNotes: "Displayed with score and band", canDisplayAlone: true },
      { id: "maxDayScore", label: "Max day score", displayNotes: "Calculated from the best hourly score", canDisplayAlone: true },
      { id: "feedingWindows", label: "Peak feeding score windows", displayNotes: "Next strong window", canDisplayAlone: false }
    ]
  },
  {
    id: "tide",
    label: "Tide",
    metrics: [
      { id: "currentTide", label: "Current tide height/stage", displayNotes: "Current height and stage", canDisplayAlone: false },
      { id: "nextTide", label: "Next high/low tide", displayNotes: "Next tide event", canDisplayAlone: false }
    ]
  },
  {
    id: "water",
    label: "Water",
    metrics: [
      { id: "waterTemperature", label: "Water temperature/range", displayNotes: "Placeholder when unavailable", canDisplayAlone: true },
      { id: "swell", label: "Swell height/period/direction/range", displayNotes: "Placeholder when unavailable", canDisplayAlone: true }
    ]
  },
  {
    id: "solunar",
    label: "Solunar",
    metrics: [
      { id: "solunarFeedingWindows", label: "Major/minor feeding windows", displayNotes: "Shown in Full Conditions", canDisplayAlone: false },
      { id: "solunarStatus", label: "Current solunar status/trend", displayNotes: "Neutral, Building, Peak, or Fading", canDisplayAlone: false }
    ]
  },
  {
    id: "sunMoon",
    label: "Sun and moon",
    metrics: [
      { id: "moon", label: "Moon phase/illumination/moonrise/moonset", displayNotes: "Displayed", canDisplayAlone: true },
      { id: "sunrise", label: "Sunrise/sunset", displayNotes: "Displayed", canDisplayAlone: true },
      { id: "firstLight", label: "First light/twilight", displayNotes: "Placeholder when unavailable", canDisplayAlone: false }
    ]
  },
  {
    id: "weather",
    label: "Weather and atmospheric",
    metrics: [
      { id: "pressure", label: "Pressure current/range/trend", displayNotes: "Daily trend", canDisplayAlone: true },
      { id: "airTemperature", label: "Air temperature/range", displayNotes: "Displayed", canDisplayAlone: true },
      { id: "feelsLike", label: "Feels-like temperature", displayNotes: "Minor to air temperature", canDisplayAlone: false },
      { id: "wind", label: "Wind speed/direction", displayNotes: "Displayed", canDisplayAlone: true },
      { id: "gust", label: "Gust speed", displayNotes: "Minor to wind", canDisplayAlone: false },
      { id: "cloud", label: "Cloud baseline", displayNotes: "Displayed", canDisplayAlone: true },
      { id: "rainChance", label: "Rain chance", displayNotes: "Displayed", canDisplayAlone: true },
      { id: "rainVolume", label: "Rain volume", displayNotes: "Minor to rain chance", canDisplayAlone: false },
      { id: "uv", label: "Peak UV", displayNotes: "Placeholder when unavailable", canDisplayAlone: true }
    ]
  }
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
  { id: "wind", label: "Wind speed/direction" },
  { id: "gust", label: "Gust speed" },
  { id: "cloud", label: "Cloud cover" },
  { id: "rainChance", label: "Rain chance" },
  { id: "rainVolume", label: "Rain volume" },
  { id: "uv", label: "UV index" }
] as const;

export type DailyGroupId = typeof DAILY_GROUPS[number]["id"];
export type DailyMetricId = typeof DAILY_GROUPS[number]["metrics"][number]["id"];
export type HourlyMetricId = typeof HOURLY_METRICS[number]["id"];
