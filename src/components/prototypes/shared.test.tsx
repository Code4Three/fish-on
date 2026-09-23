import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import conditionsFixture from "../../../public/conditions.json";
import { buildDayData } from "../../data/conditions";
import { FullConditionsView, PressureCard, WaterDetailsCard, SolunarDetailsCard, WeatherDetailsCard } from "./shared";

describe("Dashboard detail cards", () => {
  const fullDay = buildDayData(conditionsFixture.days, 0);

  it("renders WaterDetailsCard with complete data", () => {
    render(<WaterDetailsCard day={fullDay} hour={7} />);
    expect(screen.getByText(/Water & marine details/i)).toBeInTheDocument();
  });

  it("renders WaterDetailsCard placeholders when ranges/slack data missing", () => {
    const partialDay = { ...fullDay, ranges: undefined };
    render(<WaterDetailsCard day={partialDay} hour={7} />);
    const placeholders = screen.getAllByText("--");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("renders SolunarDetailsCard with complete data", () => {
    render(<SolunarDetailsCard day={fullDay} hour={7} />);
    expect(screen.getByText(/Astronomical & solunar details/i)).toBeInTheDocument();
  });

  it("renders SolunarDetailsCard placeholders when moon/sun data missing", () => {
    const partialDay = { ...fullDay, secondary: { ...fullDay.secondary, moon: undefined }, sun: undefined };
    render(<SolunarDetailsCard day={partialDay} hour={7} />);
    const placeholders = screen.getAllByText("--");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("renders WeatherDetailsCard with complete data", () => {
    render(<WeatherDetailsCard day={fullDay} hour={7} />);
    expect(screen.getByText(/^Weather$/i)).toBeInTheDocument();
  });

  it("renders the atmospheric pressure hero card", () => {
    render(<PressureCard day={fullDay} hour={7} />);
    expect(screen.getByText(/Atmospheric pressure/i)).toBeInTheDocument();
  });

  it("renders Full Conditions as the detail-card page without an hourly duplicate", () => {
    render(<FullConditionsView day={fullDay} hour={7} onClose={() => undefined} />);
    expect(screen.getByText("Full Conditions")).toBeInTheDocument();
    expect(screen.getAllByText(/Water & marine details/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Astronomical & solunar details/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Weather$/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Current conditions")).not.toBeInTheDocument();
  });

  it("renders WeatherDetailsCard placeholders when ranges missing", () => {
    const partialDay = { ...fullDay, ranges: undefined };
    render(<WeatherDetailsCard day={partialDay} hour={7} />);
    const placeholders = screen.getAllByText("--");
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
