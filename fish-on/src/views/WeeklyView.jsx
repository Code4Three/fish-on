import React, { useEffect, useState } from "react";

const CELL_WIDTH = "100px";

export default function WeeklyView() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConditions() {
      try {
        const response = await fetch("/conditions.json");
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
  if (!conditions) return <div>No conditions data found.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {conditions.days.map((day) => (
        <DayBlock key={day.date} day={day} />
      ))}
    </div>
  );
}

function DayBlock({ day }) {
  return (
    <div
      style={{
      border: "2px solid red",
      padding: "1rem",
      marginBottom: "1rem"
      }}
    >
      <h2>{day.date}</h2>

      <div style={{ display: "flex", flexDirection: "row" }}>
        {/* Left column: anchored events */}
        <AnchoredEvents anchored={day.anchored} />

        {/* Right column: hour-by-hour scrollable */}
        <HourlyTimeline hours={day.hours} />
      </div>
    </div>
  );
}

function AnchoredEvents({ anchored }) {
  const rows = [
    ["High Tides", anchored.highTides?.map(t => t.time).join(", ")],
    ["Low Tides", anchored.lowTides?.map(t => t.time).join(", ")],
    ["Sunrise", anchored.sunrise],
    ["Sunset", anchored.sunset],
    ["Moonrise", anchored.moonrise],
    ["Moonset", anchored.moonset],
    ["Moon Phase", anchored.moonPhase],
    ["Solunar Peaks", anchored.solunarPeaks?.join(", ")],
    ["Weather Summary", anchored.weatherSummary],
    ["Temp Range", anchored.tempRange?.join(" - ")],
    ["Wind Baseline", anchored.windBaseline],
    ["Cloud Baseline", anchored.cloudBaseline],
    ["Pressure Range", anchored.pressureRange?.join(" - ")],
    ["Day Score", anchored.dayScore],
  ];

  return (
    <div style={{ minWidth: "200px", marginRight: "1rem" }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ marginBottom: "0.5rem" }}>
          <strong>{label}:</strong> {value ?? "-"}
        </div>
      ))}
    </div>
  );
}

function HourlyTimeline({ hours }) {
  return (
    <div
      style={{
      overflowX: "scroll",
      whiteSpace: "nowrap",
      border: "2px solid green",
      paddingLeft: "1rem",
      flexGrow: 1
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
      <div
        style={{
          width: "200px", 
          minWidth: "200px",
          border: "1px solid black",
          padding: "4px",
          fontWeight: "bold"
        }}
      >
        Hour
      </div>
        {hours.map((h) => (
          <div
            key={h.time}
            style={{
            width: CELL_WIDTH,
            minWidth: CELL_WIDTH,
            textAlign: "center",
            border: "1px solid orange",
            padding: "4px"
            }}
          >
            {h.time}
          </div>
        ))}
      </div>

      {/* Tide Stage */}
      <Row label="Tide Stage" values={hours.map(h => h.tideStage)} />

      {/* Solunar Strength */}
      <Row label="Solunar" values={hours.map(h => h.solunarStrength)} />

      {/* Pressure Trend */}
      <Row label="Pressure" values={hours.map(h => h.pressureTrend)} />

      {/* Weather Condition */}
      <Row label="Weather" values={hours.map(h => h.weatherCondition)} />

      {/* Wind */}
      <Row label="Wind" values={hours.map(h => h.wind)} />

      {/* Hour Score */}
      <Row label="Score" values={hours.map(h => h.hourScore)} />
    </div>
  );
}

function Row({ label, values }) {
  return (
    <div style={{ display: "flex", marginBottom: "0.5rem" }}>
    <div
      style={{
        width: "200px", 
        minWidth: "200px",
        border: "1px solid black",
        padding: "4px",
        fontWeight: "bold"
      }}
    >
{label}
</div>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
          width: CELL_WIDTH,
          minWidth: CELL_WIDTH,
          textAlign: "center",
          border: "1px solid purple",
          padding: "4px",
          whiteSpace: "normal",
          wordBreak: "normal"
          }}
        >
          {v ?? "-"}
        </div>
      ))}
    </div>
  );
}
