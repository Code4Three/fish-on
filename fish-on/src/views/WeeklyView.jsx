import { useEffect, useState } from "react";
import "./WeeklyView.css";
import { formatDisplayDate } from "../utils/dateUtils.js";

export default function WeeklyView() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConditions() {
      try {
        const response = await fetch("/conditions.json");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setConditions(data);
      } catch (err) {
        console.error("Error loading conditions.json:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConditions();
  }, []);

  if (loading) return <div>Loading weekly conditions...</div>;
  if (!conditions?.days?.length) return <div>No conditions data found.</div>;

  return (
    <main className="weekly-view">
      <header className="weekly-header">
        <p className="eyebrow">Fishing conditions</p>
        <h1>Fortnightly outlook</h1>
        <p>Tides, daylight, and lunar timing for the next available days.</p>
      </header>

      <div className="day-list">
      {conditions.days.map((day) => (
        <DayBlock key={day.date} day={day} />
      ))}
      </div>
    </main>
  );
}

function DayBlock({ day }) {
  return (
    <section className="day-block">
      <div className="day-heading">
        <p className="eyebrow">Daily conditions</p>
        <h2>{formatDisplayDate(day.date)}</h2>
      </div>

      <div className="day-content">
        <AnchoredEvents anchored={day.anchored} />
        <HourlyTimeline hours={day.hours} />
      </div>
    </section>
  );
}

function AnchoredEvents({ anchored }) {
  const rows = [
    ["High tides", anchored.highTides?.map(t => t.time).join(", ")],
    ["Low tides", anchored.lowTides?.map(t => t.time).join(", ")],
    ["Sunrise", anchored.sunrise],
    ["Sunset", anchored.sunset],
    ["Moonrise", anchored.moonrise],
    ["Moonset", anchored.moonset],
    ["Moon phase", anchored.moonPhase],
    ["Moon illumination", formatPercentage(anchored.illumination)],
    ["Solunar peaks", formatSolunarPeaks(anchored.solunarPeaks)],
    ["Weather summary", anchored.weatherSummary],
    ["Temperature range", formatRange(anchored.tempRange)],
    ["Wind range", formatRange(anchored.windRange) ?? anchored.windBaseline],
    ["Cloud cover", formatCloud(anchored.cloudBaseline)],
    ["Pressure range", formatRange(anchored.pressureRange)],
  ];

  return (
    <div className="anchored-events">
      {rows.map(([label, value]) => (
        <div className="event-row" key={label}>
          <span>{label}</span>
          <strong>{value ?? "-"}</strong>
        </div>
      ))}
    </div>
  );
}

function formatPercentage(value) {
  return value == null ? null : `${value}%`;
}

function formatRange(values) {
  if (!values) return null;
  const [min, max] = values;
  if (min == null && max == null) return null;
  if (min == null) return String(max);
  if (max == null) return String(min);
  return `${min} - ${max}`;
}

function formatCloud(value) {
  return value == null ? null : `${value}%`;
}

function formatSolunarPeaks(peaks) {
  return peaks
    ?.map(peak => `${peak.type} ${peak.time ?? "-"}`)
    .join(", ");
}

function HourlyTimeline({ hours }) {
  return (
    <div className="hourly-timeline">
      <div className="timeline-row timeline-header">
        <div className="timeline-label">Hour</div>
        {hours.map((h) => (
          <div
            key={h.time}
            className="timeline-cell"
          >
            {h.time}
          </div>
        ))}
      </div>

      <Row label="Tide Stage" values={hours.map(h => h.tideStage)} />
      <Row label="Solunar" values={hours.map(h => h.solunarCondition)} />
      <Row label="Weather" values={hours.map(h => h.weatherCondition)} />
      <Row label="Pressure" values={hours.map(h => h.pressureTrend)} />
      <Row label="Wind" values={hours.map(h => h.wind)} />
      <Row label="Temp" values={hours.map(h => h.temperature == null ? null : `${h.temperature}°C`)} />
      <Row label="Cloud" values={hours.map(h => h.cloudCover == null ? null : `${h.cloudCover}%`)} />
      <Row label="Rain" values={hours.map(h => h.rainChance == null ? null : `${h.rainChance}%`)} />
    </div>
  );
}

function Row({ label, values }) {
  return (
    <div className="timeline-row">
    <div className="timeline-label">{label}</div>
      {values.map((v, i) => (
        <div
          key={i}
          className="timeline-cell"
        >
          {v ?? "-"}
        </div>
      ))}
    </div>
  );
}
