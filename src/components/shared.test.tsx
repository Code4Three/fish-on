import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import conditionsFixture from "../../public/conditions.json";
import { buildDayData } from "../data/conditions";
import {
  FullConditionsView,
  WaterDetailsCard,
  SunMoonDetailsCard,
  WeatherDetailsCard,
} from "./shared";

describe("Dashboard detail cards", () => {
  const fullDay = buildDayData(conditionsFixture.days, 0);

  it("renders WaterDetailsCard with complete data", () => {
    render(<WaterDetailsCard day={fullDay} hour={7} />);
    expect(screen.getByText(/Water/i)).toBeInTheDocument();
  });

  it("renders WaterDetailsCard placeholders when hourly data missing", () => {
    const partialDay = {
      ...fullDay,
      hours: fullDay.hours.map((item, index) =>
        index === 7 ? { ...item, environmentalRawValues: {} } : item,
      ),
    };
    render(<WaterDetailsCard day={partialDay} hour={7} />);
    const placeholders = screen.getAllByText("--");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("renders SunMoonDetailsCard with complete data", () => {
    render(<SunMoonDetailsCard day={fullDay} hour={7} />);
    expect(screen.getByText(/Sun and moon/i)).toBeInTheDocument();
  });

  it("renders SunMoonDetailsCard placeholders when moon/sun data missing", () => {
    const partialDay = {
      ...fullDay,
      secondary: { ...fullDay.secondary, moon: undefined },
      sun: undefined,
    };
    render(<SunMoonDetailsCard day={partialDay} hour={7} />);
    const placeholders = screen.getAllByText("--");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("renders WeatherDetailsCard with complete data", () => {
    render(<WeatherDetailsCard day={fullDay} hour={7} />);
    expect(
      screen.getByText(/Weather and atmospheric/i),
    ).toBeInTheDocument();
  });

  it("renders Full Conditions as the detail-card page without an hourly duplicate", () => {
    render(
      <FullConditionsView day={fullDay} hour={7} onClose={() => undefined} />,
    );
    expect(screen.getByText("All Conditions List")).toBeInTheDocument();
    expect(
      screen.getAllByText(/Water/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Sun and moon/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Weather and atmospheric/i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Current conditions")).not.toBeInTheDocument();
  });

  it("renders WeatherDetailsCard placeholders when ranges missing", () => {
    const partialDay = { ...fullDay, ranges: undefined };
    render(<WeatherDetailsCard day={partialDay} hour={7} />);
    const placeholders = screen.getAllByText("--");
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
