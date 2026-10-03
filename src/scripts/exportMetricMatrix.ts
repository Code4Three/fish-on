import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATALOG_ONLY_METRICS,
  DAILY_GROUPS,
  ENVIRONMENTAL_METRICS,
  HOURLY_GRID_METRICS,
  HOURLY_SECTIONS,
  METRIC_CATALOG,
  getMetricDisplayDefinition,
} from "../config/metricMatrix";

const CSV_COLUMNS = [
  "id",
  "label",
  "catalogStatus",
  "timeScope",
  "group",
  "dashboardGroupId",
  "dashboardGroupOrder",
  "dashboardMetricOrder",
  "fullConditionsOrder",
  "hourlySectionId",
  "hourlySectionOrder",
  "hourlyMetricOrder",
  "hourlyGridId",
  "hourlyGridAvailable",
  "hourlyGridToggleable",
  "hourlyGridDefaultVisible",
  "sourceHourly",
  "sourceAnchored",
  "sourceSecondary",
  "sourceRuntime",
  "sourceDailyBaseline",
  "sourceDailyRange",
  "sourceDailyMaximum",
  "sourceDailyDirection",
  "environmentalKey",
  "environmentalIcon",
  "metricUnit",
  "imperialUnit",
  "conversion",
  "metricPrecision",
  "imperialPrecision",
  "summaryCardsVisible",
  "fullConditionsVisible",
  "hourlyGridVisible",
] as const;

const csvEscape = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const dashboardGroupById = new Map(
  DAILY_GROUPS.map((group, index) => [group.id, { group, index }]),
);
const hourlySectionByMetricId = new Map(
  HOURLY_SECTIONS.flatMap((section, sectionIndex) =>
    section.metricIds.map((metricId, metricIndex) => [
      metricId,
      { section, sectionIndex, metricIndex },
    ] as const),
  ),
);
const catalogOnlyIds = new Set(CATALOG_ONLY_METRICS.map((metric) => metric.id));

const rows = METRIC_CATALOG.map((metric) => {
  const displayDefinition = getMetricDisplayDefinition(metric.id);
  const environmentalMetric = ENVIRONMENTAL_METRICS.find(
    (item) => item.id === metric.id,
  );
  const dashboardGroup = dashboardGroupById.get(metric.group);
  const hourlySection = hourlySectionByMetricId.get(metric.id);
  const hourlyGridId = environmentalMetric?.hourlySettingId ?? metric.id;
  const hourlyGridMetric = HOURLY_GRID_METRICS.find(
    (item) => item.id === hourlyGridId,
  );

  return {
    id: metric.id,
    label: metric.label,
    catalogStatus: catalogOnlyIds.has(metric.id)
      ? "catalog-only"
      : "display-definition",
    timeScope: metric.timeScope,
    group: metric.group,
    dashboardGroupId: dashboardGroup?.group.id,
    dashboardGroupOrder: dashboardGroup?.index,
    dashboardMetricOrder: metric.defaultOrder.dashboardMetric,
    fullConditionsOrder: metric.defaultOrder.fullConditions,
    hourlySectionId: hourlySection?.section.id,
    hourlySectionOrder: hourlySection?.sectionIndex,
    hourlyMetricOrder: metric.defaultOrder.hourlyMetric,
    hourlyGridId: hourlyGridMetric?.id,
    hourlyGridAvailable: hourlyGridMetric?.availableColumn,
    hourlyGridToggleable: hourlyGridMetric?.toggleable,
    hourlyGridDefaultVisible: hourlyGridMetric?.defaultVisible,
    sourceHourly: metric.source.hourly,
    sourceAnchored: metric.source.anchored,
    sourceSecondary: metric.source.secondary,
    sourceRuntime: metric.source.runtime,
    sourceDailyBaseline: metric.source.dailyBaseline,
    sourceDailyRange: metric.source.dailyRange,
    sourceDailyMaximum: metric.source.dailyMaximum,
    sourceDailyDirection: metric.source.dailyDirection,
    environmentalKey: environmentalMetric?.key,
    environmentalIcon: environmentalMetric?.icon,
    metricUnit: displayDefinition?.metricUnit,
    imperialUnit: displayDefinition?.imperialUnit,
    conversion: displayDefinition?.conversion,
    metricPrecision: displayDefinition?.metricPrecision,
    imperialPrecision: displayDefinition?.imperialPrecision,
    summaryCardsVisible: environmentalMetric?.defaultVisibility.summaryCards,
    fullConditionsVisible: environmentalMetric?.defaultVisibility.fullConditions,
    hourlyGridVisible: environmentalMetric?.defaultVisibility.hourlyGrid,
  };
});

const csv = [
  CSV_COLUMNS.join(","),
  ...rows.map((row) =>
    CSV_COLUMNS.map((column) => csvEscape(row[column])).join(","),
  ),
  "",
].join("\n");

const outputPath = path.resolve(
  process.cwd(),
  process.argv[2] ?? "METRIC_MATRIX.csv",
);

await writeFile(outputPath, csv, "utf8");
console.log(`Exported ${rows.length} metrics to ${path.relative(process.cwd(), outputPath)}`);