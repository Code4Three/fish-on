import { useEffect, useState } from "react";
import "./WeeklyView.css";
import { formatDisplayDate } from "../utils/dateUtils.js";
import scoringRules from "../config/scoringRules.json";
import {
  calculateConditionScore,
  calculateTideRating
} from "../utils/scoringEngine.js";

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
        <h1>Weekly outlook</h1>
        <p>Tides, daylight, and lunar timing for the next available days.</p>
      </header>

      <div className="day-list">
      {conditions.days.map((day) => (
        <DayBlock key={day.date} day={day} allDays={conditions.days} />
      ))}
      </div>
    </main>
  );
}

function DayBlock({ day, allDays }) {
  return (
    <section className="day-block">
      <div className="day-heading">
        <p className="eyebrow">Daily conditions</p>
        <h2>{formatDisplayDate(day.date)}</h2>
      </div>

      <div className="day-content">
        <AnchoredEvents anchored={day.anchored} />
        <div className="timeline-panel">
          <HourlyTimeline hours={day.hours} date={day.date} allDays={allDays} />
          <ScoreLegend />
        </div>
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

function HourlyTimeline({ hours, date, allDays }) {
  const tideEvents = buildTideEvents(allDays);
  const scoredHours = hours.map(hour => {
    const at = toTimestamp(date, hour.time);
    const tideRating = calculateTideRating(at, tideEvents, scoringRules);
    const solunarRating = getSolunarRating(hour.solunarCondition);
    const result = calculateConditionScore(tideRating, solunarRating, scoringRules);

    return { ...hour, ...result };
  });

  return (
    <div className="hourly-timeline">
      <div className="timeline-row timeline-header">
        <div className="timeline-label">Hour</div>
        {scoredHours.map((h) => (
          <div
            key={h.time}
            className="timeline-cell"
          >
            {h.time}
          </div>
        ))}
      </div>

      <Row
        label="Score"
        values={scoredHours.map(h => `${h.band.name} (${Math.round(h.score)})`)}
        scoredHours={scoredHours}
      />
      <Row label="Tide Stage" values={scoredHours.map(h => h.tideStage)} scoredHours={scoredHours} />
      <Row label="Solunar" values={scoredHours.map(h => h.solunarCondition)} scoredHours={scoredHours} />
      <Row label="Weather" values={scoredHours.map(h => h.weatherCondition)} scoredHours={scoredHours} />
      <Row label="Pressure" values={scoredHours.map(h => h.pressureTrend)} scoredHours={scoredHours} />
      <Row label="Wind" values={scoredHours.map(h => h.wind)} scoredHours={scoredHours} />
      <Row label="Temp" values={scoredHours.map(h => h.temperature == null ? null : `${h.temperature}°C`)} scoredHours={scoredHours} />
      <Row label="Cloud" values={scoredHours.map(h => h.cloudCover == null ? null : `${h.cloudCover}%`)} scoredHours={scoredHours} />
      <Row label="Rain" values={scoredHours.map(h => h.rainChance == null ? null : `${h.rainChance}%`)} scoredHours={scoredHours} />
    </div>
  );
}

function ScoreLegend() {
  const bands = [
    ["score-neutral", "Neutral (0-19)"],
    ["score-very-low", "Very Low (20-39)"],
    ["score-low", "Low (40-49)"],
    ["score-favorable", "Favorable (50-64)"],
    ["score-strong", "Strong (65-79)"],
    ["score-peak", "Peak (80-100)"]
  ];

  return (
    <div className="score-legend" aria-label="Fishing score colour key">
      {bands.map(([className, label]) => (
        <div className="score-legend-item" key={className}>
          <span className={`score-legend-swatch ${className}`} aria-hidden="true" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Row({ label, values, scoredHours }) {
  return (
    <div className="timeline-row">
    <div className="timeline-label">{label}</div>
      {values.map((v, i) => (
        <div
          key={i}
          className={`timeline-cell score-${scoredHours[i].band.name.toLowerCase().replace(" ", "-")}`}
          title={`${scoredHours[i].band.name}: ${Math.round(scoredHours[i].score)}/100`}
        >
          {v ?? "-"}
        </div>
      ))}
    </div>
  );
}

function buildTideEvents(days) {
  return days
    .flatMap(day => [
      ...(day.anchored.lowTides ?? []).map(tide => ({
        ...tide,
        type: "Low",
        at: toTimestamp(day.date, tide.time)
      })),
      ...(day.anchored.highTides ?? []).map(tide => ({
        ...tide,
        type: "High",
        at: toTimestamp(day.date, tide.time)
      }))
    ])
    .sort((a, b) => a.at - b.at);
}

function toTimestamp(date, time) {
  return new Date(`${date}T${time}:00`).getTime();
}

function getSolunarRating(condition) {
  if (!condition) return 0;

  return [
    ["Major 1", 100],
    ["Major 2", 80],
    ["Minor 1", 60],
    ["Minor 2", 40]
  ].find(([name]) => condition.includes(name))?.[1] ?? 0;
}
