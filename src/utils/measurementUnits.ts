import {
    getMetricDisplayDefinition,
    type UnitSystem,
} from "../config/metricMatrix";

const METERS_PER_FOOT = 0.3048;
const KILOMETERS_PER_MILE = 1.609344;
const MILLIMETERS_PER_INCH = 25.4;
const HECTOPASCALS_PER_INCH_OF_MERCURY = 33.8638866667;

function roundForDisplay(value: number, precision: number): number {
    return Number(value.toFixed(precision));
}

export function convertMetricValue(
    metricId: string,
    value: number,
    unitSystem: UnitSystem,
): number | null {
    if (!Number.isFinite(value)) return null;
    if (unitSystem === "metric") return value;

    const definition = getMetricDisplayDefinition(metricId);
    if (!definition) return null;

    switch (definition.conversion) {
        case "temperature":
            return (value * 9) / 5 + 32;
        case "speed":
            return value / KILOMETERS_PER_MILE;
        case "metersToFeet":
            return value / METERS_PER_FOOT;
        case "kilometersToMiles":
            return value / KILOMETERS_PER_MILE;
        case "millimetersToInches":
            return value / MILLIMETERS_PER_INCH;
        case "pressure":
            return value / HECTOPASCALS_PER_INCH_OF_MERCURY;
        case "none":
            return value;
    }
}

export function convertDisplayValueToMetric(
    metricId: string,
    value: number,
    unitSystem: UnitSystem,
): number | null {
    if (!Number.isFinite(value)) return null;
    if (unitSystem === "metric") return value;

    const definition = getMetricDisplayDefinition(metricId);
    if (!definition) return null;

    switch (definition.conversion) {
        case "temperature":
            return ((value - 32) * 5) / 9;
        case "speed":
            return value * KILOMETERS_PER_MILE;
        case "metersToFeet":
            return value * METERS_PER_FOOT;
        case "kilometersToMiles":
            return value * KILOMETERS_PER_MILE;
        case "millimetersToInches":
            return value * MILLIMETERS_PER_INCH;
        case "pressure":
            return value * HECTOPASCALS_PER_INCH_OF_MERCURY;
        case "none":
            return value;
    }
}

export function getMetricUnit(metricId: string, unitSystem: UnitSystem): string {
    const definition = getMetricDisplayDefinition(metricId);
    if (!definition) return "";
    return unitSystem === "imperial"
        ? definition.imperialUnit
        : definition.metricUnit;
}

export function formatMetricLabel(
    metricId: string,
    unitSystem: UnitSystem,
    includeUnit = false,
): string {
    const definition = getMetricDisplayDefinition(metricId);
    if (!definition) return metricId;
    const unit = getMetricUnit(metricId, unitSystem);
    return includeUnit && unit
        ? `${definition.label} (${unit})`
        : definition.label;
}

export function formatMetricValue(
    metricId: string,
    value: number | string | null | undefined,
    unitSystem: UnitSystem,
    includeUnit = true,
    fallback = "--",
): string {
    if (value == null || value === "") return fallback;
    if (typeof value === "string") return value;

    const definition = getMetricDisplayDefinition(metricId);
    const convertedValue = convertMetricValue(metricId, value, unitSystem);
    if (convertedValue == null || !definition) return fallback;
    const precision =
        unitSystem === "imperial"
            ? definition.imperialPrecision
            : definition.metricPrecision;
    const formattedValue = String(roundForDisplay(convertedValue, precision));
    const unit = getMetricUnit(metricId, unitSystem);
    if (!includeUnit || !unit) return formattedValue;
    if (unit === "%" || unit.startsWith("°")) return `${formattedValue}${unit}`;
    return `${formattedValue} ${unit}`;
}

export function formatMetricRange(
    metricId: string,
    range:
        | readonly (number | null | undefined)[]
        | { min: number | null | undefined; max: number | null | undefined }
        | null
        | undefined,
    unitSystem: UnitSystem,
    includeUnit = true,
    fallback = "--",
): string {
    if (!range) return fallback;
    const minimum = "min" in range ? range.min : range[0];
    const maximum = "max" in range ? range.max : range[1];
    if (minimum == null && maximum == null) return fallback;
    return `${formatMetricValue(metricId, minimum, unitSystem, includeUnit, fallback)} - ${formatMetricValue(metricId, maximum, unitSystem, includeUnit, fallback)}`;
}
