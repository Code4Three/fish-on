import { describe, expect, it } from "vitest";
import { processWeatherResponse } from "./weather.js";

const testDate = "2026-09-27";

function buildWeatherResponse() {
    return {
        hourly: {
            time: [`${testDate}T00:00`, `${testDate}T02:00`],
            temperature_2m: [18.4, 21.6],
            apparent_temperature: [18.2, 21.4],
            relative_humidity_2m: [80, 60],
            dew_point_2m: [12.34, 14.56],
            surface_pressure: [1024.4, 1026.6],
            cloud_cover: [100, 0],
            cloud_cover_low: [40, 20],
            precipitation_probability: [120, null],
            precipitation: [0.26, null],
            wind_speed_10m: [10, null],
            wind_gusts_10m: [12, null],
            wind_direction_10m: [90, null],
            uv_index: [4, null],
            weather_code: [61, 0],
        },
        daily: {
            time: [testDate],
            weather_code: [61],
            temperature_2m_min: [17],
            temperature_2m_max: [22],
            apparent_temperature_min: [18],
            apparent_temperature_max: [23],
            precipitation_sum: [0.52],
            precipitation_probability_max: [98],
            wind_speed_10m_max: [20],
            wind_gusts_10m_max: [29],
            wind_direction_10m_dominant: [90],
            uv_index_max: [8],
            surface_pressure_mean: [1025.5],
        },
    };
}

function buildMarineResponse() {
    return {
        hourly: {
            time: [`${testDate}T00:00`, `${testDate}T02:00`],
            sea_surface_temperature: [20.26, 20.84],
            wave_height: [1.24, 1.36],
            wave_direction: [90, 90],
            wave_period: [7.25, 7.85],
            wind_wave_height: [0.24, 0.46],
            wind_wave_direction: [45, 45],
            wind_wave_period: [2.24, 2.86],
            swell_wave_height: [1.04, 1.16],
            swell_wave_direction: [135, 135],
            swell_wave_period: [6.24, 6.86],
        },
        daily: {
            time: [testDate],
            wave_height_max: [1.44],
            wave_direction_dominant: [90],
            wave_period_max: [7.86],
            wind_wave_height_max: [0.46],
            wind_wave_direction_dominant: [45],
            wind_wave_period_max: [2.86],
            swell_wave_height_max: [1.16],
            swell_wave_direction_dominant: [135],
            swell_wave_period_max: [6.86],
        },
    };
}

describe("processWeatherResponse", () => {
    it("aggregates daily metrics and maps hourly values to fixed 24-hour slots", () => {
        const [day] = processWeatherResponse(
            buildWeatherResponse(),
            buildMarineResponse(),
        ).days;

        expect(day.hours).toHaveLength(24);
        expect(day.hours.map((hour) => hour.time)).toEqual(
            Array.from({ length: 24 }, (_, hourIndex) =>
                `${String(hourIndex).padStart(2, "0")}:00`,
            ),
        );
        expect(day.hours[0]).toMatchObject({
            temperature: 18,
            humidity: 80,
            dewPoint: 12.3,
            seaSurfaceTemperature: 20.3,
            waveHeight: 1.2,
            swellWaveHeight: 1,
        });
        expect(day.hours[1]).toMatchObject({
            time: "01:00",
            temperature: null,
            humidity: null,
            seaSurfaceTemperature: null,
            waveHeight: null,
        });
        expect(day.hours[2]).toMatchObject({
            temperature: 22,
            humidity: 60,
            dewPoint: 14.6,
            waveHeight: 1.4,
        });
        expect(day).toMatchObject({
            tempRange: [17, 22],
            humidityRange: [60, 80],
            humidityBaseline: 70,
            pressureRange: [1024, 1027],
            pressureBaseline: 1026,
            waveHeightMax: 1.4,
            waveDirectionDominant: "E",
        });
    });

    it("fills incomplete provider responses with null metric values", () => {
        const [day] = processWeatherResponse({
            hourly: {
                time: [`${testDate}T00:00`],
                relative_humidity_2m: [null],
                dew_point_2m: [null],
                precipitation_probability: [130],
                cloud_cover: [null],
            },
            daily: { time: [testDate] },
        }).days;

        expect(day.hours).toHaveLength(24);
        expect(day.hours[0]).toMatchObject({
            humidity: null,
            dewPoint: null,
            rainChance: null,
            cloudCover: null,
            seaSurfaceTemperature: null,
            swellWaveHeight: null,
        });
        expect(day.hours[1]).toMatchObject({
            time: "01:00",
            humidity: null,
            dewPoint: null,
            cloudCover: null,
        });
        expect(day.humidityRange).toEqual([null, null]);
        expect(day.dewPointRange).toEqual([null, null]);
        expect(day.pressureRange).toEqual([null, null]);
        expect(day.waveHeightMax).toBeNull();
        expect(day.swellWavePeriodMax).toBeNull();
    });
});